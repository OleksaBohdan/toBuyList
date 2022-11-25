const Koa = require('koa');
const Router = require('koa-router');
const path = require('path');
const Product = require('./models/Product');
const User = require('./models/User');
const Session = require('./models/Session');
const Pug = require('koa-pug');
const passport = require('./libs/passport');
const uuid = require('uuid');
const mustBeAuthenticate = require('./controllers/mustBeAuthenticate');

const app = new Koa();
app.use(require('koa-bodyparser')());
app.use(require('koa-static')(path.join(__dirname, 'public')));

const pug = new Pug({
  viewPath: path.resolve(__dirname, './views'),
  locals: {},
  basedir: 'path/for/pug/extends',
  app: app,
});

const router = new Router();

router.use(async (ctx, next) => {
  const token = ctx.cookies.get('token');

  console.log(token);

  if (!token) {
    return next();
  }

  const session = await Session.findOne({ token }).populate('user');

  if (session === null) {
    ctx.redirect('/login');
    return next();
  }

  session.lastVisit = new Date();
  await session.save();
  ctx.user = session.user;
  return next();
});

router.get('/register', async (ctx, next) => {
  await ctx.render('registration', true);
});

router.post('/register', async (ctx, next) => {
  const user = {
    email: ctx.request.body.email,
    password: ctx.request.body.password,
  };

  try {
    const u = new User(user);
    await u.setPassword(user.password);
    await u.save();
    ctx.redirect('/login');
  } catch (err) {
    let errMesaage = '';
    if (err.code == 11000) {
      errMesaage = 'This email already exist!';
    } else if (err.errors.email.properties.type == 'required') {
      console.log('kind', err.errors.email.properties.type);
      errMesaage = 'E-mail cannot be empty!';
    } else {
      errMesaage = err.message;
    }
    let error = {
      err: errMesaage,
    };
    pug.locals = error;
    await ctx.render('registration', true);
  }
});

router.get('/login', async (ctx, next) => {
  await ctx.render('login', true);
});

router.post('/login', async (ctx, next) => {
  await passport.authenticate('local', async (err, user, info) => {
    if (err) throw err.message;

    if (!user) {
      ctx.status = 400;
      let err = {
        error: info,
      };
      pug.locals = err;
      await ctx.render('login', true);
      pug.locals = {};
      return;
    }

    const token = uuid.v4();
    await Session.create({ token: token, user: user, lastVisit: new Date() });
    ctx.cookies.set('token', token);

    ctx.redirect('/');
  })(ctx, next);
});

router.get('/', mustBeAuthenticate, async (ctx, next) => {
  const buyList = await Product.find({ user: ctx.user });

  let menu = {
    title: 'Menu',
    isMenu: true,
    buyList: buyList,
    email: ctx.user.email,
  };

  pug.locals = menu;
  await ctx.render('index', true);
});

router.get('/logout', mustBeAuthenticate, async (ctx, next) => {
  const token = ctx.cookies.get('token');
  await Session.findOneAndDelete({ token: token });
  ctx.cookies.set('token', null);
  ctx.redirect('/login');
});

router.get('/create', mustBeAuthenticate, async (ctx) => {
  let create = {
    title: 'Create',
    isCreate: true,
  };
  pug.locals = create;
  await ctx.render('create', true);
});

router.post('/create', mustBeAuthenticate, async (ctx, next) => {
  const productName = ctx.request.body.productName;
  const productCount = ctx.request.body.productCount;
  if (productName != '') {
    await Product.create({ productName: productName, productCount: productCount, user: ctx.user });
  }
  ctx.redirect('/');
});

router.post('/complete', mustBeAuthenticate, async (ctx, next) => {
  const id = ctx.request.body.id;
  const product = await Product.findById(id);
  if (product.isBuyed == true) {
    product.isBuyed = false;
  } else if (product.isBuyed == false) {
    product.isBuyed = true;
  }

  await product.save();

  ctx.redirect('/');
});

router.get('/clear', mustBeAuthenticate, async (ctx, next) => {
  await Product.deleteMany({ user: ctx.user });
  ctx.redirect('/');
});

app.use(router.routes());

module.exports = app;
