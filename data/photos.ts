/**
 * PHOTOS
 * Free photos from Unsplash (unsplash.com/license — free for commercial use).
 * They are placeholders: replace them with your own trip photos from the
 * Admin panel (trips) or by changing the links below (homepage).
 */
export const unsplash = (id: string, w = 1800) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;

export const photos = {
  // Sahyadri
  fortRidge: unsplash("1572782252655-9c8771392601"),
  greenMountains: unsplash("1614202223024-68de9ee90bbb"),
  greenValley: unsplash("1663079156029-a170af256f67"),
  hillsTrees: unsplash("1663745430674-180c6858f46c"),
  monsoonPeak: unsplash("1625843019067-7e4c203a5d19"),
  waterfall: unsplash("1692626453173-7af2d5b64426"),
  lakeMountains: unsplash("1708547977769-5280488f442f"),
  ghatSunset: unsplash("1708547981655-e67e6dada4c3"),
  ghatSunset2: unsplash("1708547981669-a28c8171727e"),
  dryPeak: unsplash("1708589413153-2ea481e85822"),
  forestRoad: unsplash("1708589413921-87e9cf84fbbe"),
  villageRoad: unsplash("1710820669974-e51476c489b1"),
  greenRange: unsplash("1599108656750-54572dae5c9f"),
  // People on the trail
  sunriseSummit: unsplash("1522506209496-4536d9020ec4"),
  groupOnHill: unsplash("1729495215025-4e2885a8475c"),
  hikerOnRock: unsplash("1582469018903-51b03073761e"),
  manOnHill: unsplash("1718889549814-52f8bc4c9935"),
  // Camping
  tentStars: unsplash("1504591504549-8ce1589ea6f6"),
  tentsForest: unsplash("1432817495152-77aa949fb1e2"),
  tentTreeNight: unsplash("1507668339897-8a035aa9527d"),
  // Himalaya
  snowGroup: unsplash("1740383236283-2504af54cfd1"),
  snowWalkers: unsplash("1621861189516-3f4c3a5c98ef"),
  snowTrail: unsplash("1680531625386-a18118b6fc17"),
  pinesSnow: unsplash("1622977801247-1121e481f250"),
  // Karnataka
  hampiChariot: unsplash("1764426383343-bd8d49069b6b"),
  hampiRuins: unsplash("1722934804353-0d9f6a55ab5e"),
  hampiRiver: unsplash("1636903684031-e187417f3e77"),
  gokarnaCliffs: unsplash("1617467053978-276d9d4d5d11"),
  gokarnaCoast: unsplash("1584485031363-feb0ee583cc4"),
  beachSunset: unsplash("1585435126907-43110c69def0"),
  // Journey
  packFlatlay: unsplash("1485809052957-5113b0ff51af"),
  carGreenRoad: unsplash("1709105134096-7f0ebf30a3b5"),
};
