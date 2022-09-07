module.exports = async function mustBeAuthenticate(ctx, next) {
  if (!ctx.user) {
    ctx.redirect('/login', true);
    return;
  }

  return next();
};
