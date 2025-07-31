#!/bin/bash

echo "Starting Spring Boot Backend..."

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "Maven is not installed. Please install Maven first."
    exit 1
fi

# Clean and compile the project
echo "Compiling the project..."
mvn clean compile

# Run the Spring Boot application
echo "Starting the backend server on port 8080..."
mvn spring-boot:run
