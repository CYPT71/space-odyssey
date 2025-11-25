---
layout: default
title: "Terraform Tutorial: Infrastructure as Code"
date: 2024-11-15
tags: [terraform, iac, cloud]
category: tech
subcategory: tutorials
---

# Terraform Tutorial: Infrastructure as Code

Learn how to manage your infrastructure with Terraform, the leading Infrastructure as Code tool.

## What is Terraform?

Terraform is an open-source tool that allows you to define infrastructure using declarative configuration files.

## Basic Example

```hcl
# Configure AWS Provider
provider "aws" {
  region = "us-west-2"
}

# Create VPC
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  
  tags = {
    Name = "main-vpc"
  }
}

# Create Subnet
resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
  
  tags = {
    Name = "public-subnet"
  }
}
```

## Terraform Workflow

1. **Write** - Define infrastructure in `.tf` files
2. **Plan** - Preview changes with `terraform plan`
3. **Apply** - Execute changes with `terraform apply`
4. **Destroy** - Clean up with `terraform destroy`

## Best Practices

- Use remote state (S3, Terraform Cloud)
- Organize code with modules
- Use variables for flexibility
- Version control your `.tf` files

## Advanced Topics

- State locking
- Workspaces
- Provisioners
- Data sources

Start automating your infrastructure today! ⚡
