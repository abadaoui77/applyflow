function validateApplicationId(req, res, next, value) {
  const id = Number(value);

  // PostgreSQL SERIAL identifiers are positive 32-bit integers.
  if (!/^[1-9]\d*$/.test(value) || !Number.isInteger(id) || id > 2_147_483_647) {
    return res.status(400).json({
      message: "L’identifiant doit être un entier positif valide."
    });
  }

  next();
}

export default validateApplicationId;
