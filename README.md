## Starting Repo for MERN Stack - The Complete Guide

# Credentials

## Gmail:

- username: `class23.hyf@gmail.com`
- password: `hyf.class23.nl$`

## Firebase:

- url: `https://console.firebase.google.com`
  (you need to be signed in with the gmail account)
- project: `hackyourshop`

## mongodb (atlas):

- connection string: `mongodb+srv://root-dbuser:7b6Deek3BMzX2gk@hackyourshop-iysqr.mongodb.net/test?retryWrites=true&w=majority`
- username: `class23.hyf@gmail.com`
- password: `db.mongo.clss23.nl\$`
- root user: `root-dbuser`
- root user password: `7b6Deek3BMzX2gk`

## Cloudinary:

- CLOUDINARY_URL: `cloudinary://481818939869213:HLuX_Wcz2tDV20U83ndgPL06ZPg@dy7xzflbz`
- username: `class23.hyf@gmail.com`
- password: `image.class23HYF\$`

## For social login:

- Gmail: all gmail accounts are allowed
- Facebook: Not all accounts are allowed. To make it possible for all users we need to provide, Privacy Policy URL and Terms of Service URL. So we are using test accounts. For the time being there are 4 test accounts:
- Facebook Test accounts:
  - email: `margaret_lcxndrt_bowersson@tfbnw.net` password: `123456.asd`
  - email: `yfhpujkxob_1581956055@tfbnw.net` password: `123456.asd`
  - email: `samantha_jooshzy_mcdonaldman@tfbnw.net` password: `123456.asd`
  - email: `mike_nbhcvny_mcdonaldman@tfbnw.net` password: `123456.asd`

## Stripe:

- email: `class23.hyf@gmail.com`
- password: `hyf.class23.nl$`
- publishable key (frontend) : `pk_test_CxNl8AOYSrEso5vij6ems2BK00HCvRY9YF`
- secret ket (env variable) : `sk_test_dPiAzZ4STF4DIhGHO495RW6v00UMFwJjjk`

## next.config

```module.exports = {
  env: {
    MONGO_SRV: "mongodb+srv://root-dbuser:7b6Deek3BMzX2gk@hackyourshop-iysqr.mongodb.net/test?retryWrites=true&w=majority",
    JWT_SECRET: "~&8Q5gu;!29hsK`U$SJ:q__>ydNUl@K}kTRJ2[{OM-k4>sgoW*}&to.2Z]p#cb{N-;-2Ff&W//4#eqc[Z_:5k$4~}vN&NvX/1Qm!w)a/zG]Y}2J<M=I[131H/TH=<",
    CLOUDINARY_URL: "https://api.cloudinary.com/v1_1/dy7xzflbz/image/upload",
    STRIPE_SECRET_KEY: "sk_test_dPiAzZ4STF4DIhGHO495RW6v00UMFwJjjk",
    SENDGRID_USERNAME: 'apikey',
    SENDGRID_PASSWORD: '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',
  }
}
```
