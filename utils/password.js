import passwordValidator from 'password-validator';

export default function validatePassword(password) {
  const pwSchema = new passwordValidator();
  pwSchema
    .is()
    .min(8)
    .has()
    .uppercase()
    .has()
    .lowercase()
    .has()
    .digits()
    .has()
    .symbols()
    .has()
    .not()
    .spaces();

  const pwErrors = {
    min: 'at least 8 characters',
    uppercase: 'at least 1 uppercase',
    lowercase: 'at least 1 lowercase',
    digits: 'at least 1 digit',
    symbols: 'at least 1 symbol',
    spaces: 'no spaces',
  };

  const errorList = pwSchema.validate(password, { list: true });

  if (errorList.length) {
    const errorMessages = Object.assign(
      {},
      ...Object.entries(pwErrors).map(
        ([key, prop]) => errorList.includes(key) && { [key]: prop },
      ),
    );
    return Object.values(errorMessages);
  } else {
    return null;
  }
}
