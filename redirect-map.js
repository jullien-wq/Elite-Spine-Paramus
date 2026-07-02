// ============================================================
//  Redirect map — old Wix paths → new internal pages
//  Used by 404.html as a client-side fallback for static hosts
//  that don't process the _redirects file.
// ============================================================
window.REDIRECT_MAP = {
  // Home / thank-you
  "/thankyou": "/index.html",

  // Services & individual treatment pages → services section
  "/services": "/conditions-services.html#services",
  "/physical-therapy": "/conditions-services.html#services",
  "/chiropractic-care": "/conditions-services.html#services",
  "/extracorporeal-shockwave-therapy": "/conditions-services.html#services",
  "/active-release-technique-art": "/conditions-services.html#services",
  "/copy-of-pre-post-operation": "/conditions-services.html#services",   // Dry Needling
  "/pre-post-operation": "/conditions-services.html#services",
  "/pre-post-natal-care": "/conditions-services.html#services",
  "/deep-tissue-laser-therapy": "/conditions-services.html#services",
  "/graston-technique": "/conditions-services.html#services",
  "/massage-therapy": "/conditions-services.html#services",
  "/therapeutic-taping": "/conditions-services.html#services",
  "/occupational-therapy": "/conditions-services.html#services",

  // About / team
  "/about-us": "/index.html#about",
  "/our-team": "/team.html",
  "/our-session": "/index.html#resources",

  // Location / contact
  "/our-location": "/index.html#contact",
  "/contact-us-1": "/index.html#contact",
  "/free-consultation": "/index.html#request",

  // Insurance & blog
  "/insurance": "/insurance.html",
  "/blog": "/blog.html"
};
