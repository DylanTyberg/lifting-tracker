# Lifting Tracker

A full-stack workout tracking app to log exercises, track personal records, and manage workout templates.

🔗 **Live Site** [lifting-tracker.htytun.com](https://lifting-tracker.htytun.com)

## Architecture

<img width="1080" height="1273" alt="image" src="https://github.com/user-attachments/assets/4d35f475-953c-403d-8fb2-0331eeb0aceb" />

DNS is handled by **Route 53**, routing traffic to **CloudFront** which serves the React frontend from **S3** and proxies API requests through an **Application Load Balancer** into a VPC. The backend runs as a containerized Node.js/Express app on **ECS Fargate Spot** within a public subnet, with **DynamoDB** as the database.

**Note:** The Fargate service runs in a public subnet rather than a private subnet. While a private subnet is best practice for production workloads, placing tasks in a public subnet avoids the need for a NAT Gateway (~$32/month), keeping the architecture cost-optimized.

## Tech Stack

**Frontend:** React  
**Backend:** Node.js, Express  
**Database:** AWS DynamoDB  
**Infrastructure:** AWS ECS Fargate Spot, ECR, CDK  

## Features

- Log exercise sets individually or as part of a workout
- Track last and best performance for each exercise
- Create and reuse workout templates
- View recent workout history

## Infrastructure

- Containerized Express API deployed on **AWS ECS Fargate Spot** with Docker
- **Infrastructure as Code** via AWS CDK for reproducible, cost-optimized deployments (~$5–10/month)
- **CI/CD pipeline** with automated ECR image builds and ECS deployments on push
