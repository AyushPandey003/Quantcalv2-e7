# Environment Variables Setup

To fix the JWT authentication error, you need to set the following environment variables in your `.env` file:

## Required Environment Variables

### Database Configuration
```bash
DATABASE_URL="postgresql://username:password@host:port/database"
```

### JWT Configuration (CRITICAL - This fixes the login error)
```bash
JWT_ACCESS_TOKEN_SECRET="your-super-secret-access-token-key-at-least-32-characters-long"
JWT_REFRESH_TOKEN_SECRET="your-super-secret-refresh-token-key-at-least-32-characters-long"
JWT_ACCESS_TOKEN_EXPIRES_IN="15m"
JWT_REFRESH_TOKEN_EXPIRES_IN="7d"
```

### Optional: WalletConnect Project ID
```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your-walletconnect-project-id"
```

### Environment
```bash
NODE_ENV="development"
```

## How to Fix the Current Error

The error `Zero-length key is not supported` occurs because the JWT secret keys are not set. 

1. Create a `.env` file in your project root
2. Add the JWT secret keys above
3. Make sure the secrets are at least 32 characters long
4. Restart your development server

## Example .env file content:
```bash
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/your_database"
JWT_ACCESS_TOKEN_SECRET="this-is-a-very-long-secret-key-for-jwt-signing-12345"
JWT_REFRESH_TOKEN_SECRET="this-is-another-very-long-secret-key-for-refresh-67890"
JWT_ACCESS_TOKEN_EXPIRES_IN="15m"
JWT_REFRESH_TOKEN_EXPIRES_IN="7d"
NODE_ENV="development"
```

## Security Notes

- Never commit your `.env` file to version control
- Use strong, random strings for JWT secrets
- In production, use environment-specific secrets
- Rotate secrets regularly
