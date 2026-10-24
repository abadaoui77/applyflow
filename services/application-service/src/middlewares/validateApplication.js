const VALID_STATUSES = new Set([
  "TO_APPLY",
  "APPLIED",
  "HR_INTERVIEW",
  "TECH_INTERVIEW",
  "REJECTED",
  "OFFER"
]);

function validateApplication(req, res, next) {
  const body = req.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({
      message: "Un objet JSON est attendu."
    });
  }

  const { company, role, status, offer_url, notes } = body;

  if (typeof company !== "string" || !company.trim()) {
    return res.status(400).json({
      message: "L’entreprise est obligatoire."
    });
  }

  if (typeof role !== "string" || !role.trim()) {
    return res.status(400).json({
      message: "Le poste est obligatoire."
    });
  }

  if (!VALID_STATUSES.has(status)) {
    return res.status(400).json({
      message: "Le statut est invalide."
    });
  }

  let normalizedUrl = null;

  if (offer_url !== undefined && offer_url !== null) {
    if (typeof offer_url !== "string") {
      return res.status(400).json({
        message: "Le lien de l’offre doit être une chaîne."
      });
    }

    if (offer_url.trim()) {
      try {
        const parsedUrl = new URL(offer_url.trim());

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          return res.status(400).json({
            message: "Le lien doit utiliser HTTP ou HTTPS."
          });
        }

        normalizedUrl = parsedUrl.href;
      } catch {
        return res.status(400).json({
          message: "Le lien de l’offre est invalide."
        });
      }
    }
  }

  if (
    notes !== undefined &&
    notes !== null &&
    typeof notes !== "string"
  ) {
    return res.status(400).json({
      message: "Les notes doivent être une chaîne."
    });
  }

  req.body = {
    company: company.trim(),
    role: role.trim(),
    status,
    offer_url: normalizedUrl,
    notes: typeof notes === "string" ? notes.trim() : null
  };

  next();
}

export default validateApplication;