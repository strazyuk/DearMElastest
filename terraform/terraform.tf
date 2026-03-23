terraform {
  backend "s3" {
    bucket = "dearme-terraform-state-asira"
    key    = "terraform/state"
    region = "ap-south-1"
  }
}

# --- 1. Automated Packaging (The "True Pure" Way for Windows) ---
# This block runs the PowerShell script and gets the file path and hash
# It runs during 'plan' and 'apply' automatically.
data "external" "lambda_package" {
  program = [var.powershell_command, "-ExecutionPolicy", "Bypass", "-File", "${path.module}/package_lambda.ps1"]
}

# --- 2. Provider Configuration ---
provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project = "DearME"
    }
  }
}

# --- 3. Variables ---
variable "powershell_command" {
  type    = string
  default = "Powershell.exe"
}

variable "aws_region" { default = "ap-south-1" }
variable "supabase_url" { type = string }
variable "supabase_service_key" {
  type      = string
  sensitive = true
}

variable "encryption_key" {
  type      = string
  sensitive = true
}

variable "supabase_jwt_secret" {
  type      = string
  sensitive = true
}

variable "database_url" {
  type      = string
}

variable "gemini_api_key" {
  type      = string
  sensitive = true
}

variable "allowed_origins" {
  type    = string
  default = "http://localhost:5173"
}

# --- 4. IAM Role for Lambda ---
resource "aws_iam_role" "lambda_exec" {
  name = "dearme_lambda_exec_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "ssm_read" {
  name = "dearme_ssm_read"
  role = aws_iam_role.lambda_exec.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["ssm:GetParameter"]
      Resource = "arn:aws:ssm:${var.aws_region}:*:parameter/dearme/prod/*"
    }]
  })
}

# --- 5. SSM Parameter ---
resource "aws_ssm_parameter" "encryption_key" {
  name  = "/dearme/prod/encryption-key"
  type  = "SecureString"
  value = var.encryption_key
}

resource "aws_budgets_budget" "monthly_budget" {
  name              = "monthly-budget-dearme"
  budget_type       = "COST"
  limit_amount      = "5.0"
  limit_unit        = "USD"
  time_unit         = "MONTHLY"
  time_period_start = "2024-01-01_00:00"

  cost_filter {
    name = "TagKeyValue"
    values = [
      "user:Project$DearME"
    ]
  }

  notification {
    comparison_operator = "GREATER_THAN"
    threshold          = 80
    threshold_type     = "PERCENTAGE"
    notification_type  = "ACTUAL"
    subscriber_email_addresses = ["asirabrar789@gmail.com"]
  }
}

# --- 6. Lambda Function ---
resource "aws_lambda_function" "api" {
  function_name = "dearme-api"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "main.handler"
  runtime       = "python3.11"
  memory_size   = 512
  timeout       = 30

  # These values now come dynamically from the packaging script!
  filename         = data.external.lambda_package.result.zip_path
  source_code_hash = filebase64sha256(data.external.lambda_package.result.zip_path)

  environment {
    variables = {
      SUPABASE_URL         = var.supabase_url
      SUPABASE_SERVICE_KEY = var.supabase_service_key
      SUPABASE_JWT_SECRET  = var.supabase_jwt_secret
      DATABASE_URL         = var.database_url
      ENCRYPTION_KEY       = var.encryption_key
      GEMINI_API_KEY      = var.gemini_api_key
      ALLOWED_ORIGINS      = var.allowed_origins
      DEPLOY_VERSION      = "1.0.2"
    }
  }
}

# --- 7. API Gateway (HTTP API) ---
resource "aws_apigatewayv2_api" "http_api" {
  name          = "dearme-http-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "prod" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id           = aws_apigatewayv2_api.http_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.api.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "default_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}

# --- 9. Outputs ---
output "api_url" {
  value = aws_apigatewayv2_api.http_api.api_endpoint
}
