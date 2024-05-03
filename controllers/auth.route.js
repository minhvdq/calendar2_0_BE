const {
    requestPasswordReset,
    resetPassword,
  } = require("../services/auth.service");
  
  const authRouter = require("express").Router();
  
  authRouter.post("/requestResetPassword", async (req, res, next) => {
    const requestPasswordResetService = await requestPasswordReset(
      req.body.email
    )
    return res.json(requestPasswordResetService);
  })

  authRouter.post("/resetPassword", async (req, res, next) => {
    const resetPasswordService = await resetPassword(
      req.body.userId,
      req.body.token,
      req.body.password
    )
    return res.json(resetPasswordService)})
  
  module.exports = authRouter;