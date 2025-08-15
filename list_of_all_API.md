
# all Api used In lets_connect

## profileRouter

- GET /api/v1/profile/view
- PATCH /api/v1/profile/update
- DELETE /api/v1/profile/delete

## authRouter

- POST /api/v1/auth/login
- GET /api/v1/auth/logout
- POST /api/v1/auth/signup
- POST /api/v1/auth/forgot-password

## userRouter

<!-- - POST /api/v1/user/request/send/interested/:userId
- POST /api/v1/user/request/send/ignore/:userId -->
- POST /api/v1/user/request/send/:status/:userId

<!-- - GET /api/v1/user/request/receive/accept/:requestId
- GET /api/v1/user/request/receive/reject/:requestId -->
- GET /api/v1/user/request/receive/:status/:requestId

- GET /api/v1/user/requests/received
- GET /api/v1/user/connections
- GET /api/v1/user/feed

### pagination of feed

/api/v1/user/feed?page=1&limit=10
/api/v1/user/feed?page=2&limit=20


- POST /api/v1/user/request/revert --optional
- POST /api/v1/user/connection/cancel --optional