// Green Vibes — modules/calendar.js
// Calendrier mensuel et fiches légumes

// ========== FICHES LEGUMES ENRICHIES ==========

// --- Rendus calendrier de semis (déplacés depuis core.js) ---
// --- Variables état calendrier ---
var calMoisAffiche = new Date().getMonth();
var calAnneeAffichee = new Date().getFullYear();
var calJourSelectionne = new Date().getDate();

function renderVisualCalendar() {
  var html = '<div class="forecast-section">';
  html += '<div class="section-title">' + t('cal_visual_title') + '</div>';
  html += '<div class="card" style="overflow:auto;">';
  var months = ['J','F','M','A','M','J','J','A','S','O','N','D'];
  html += '<table style="width:100%;border-collapse:collapse;font-size:0.75rem;text-align:center;">';
  // HEADER
  html += '<tr>';
  html += '<th style="text-align:left;padding:6px;">' + t('cal_veggie_col') + '</th>';
  for (var m = 0; m < 12; m++) {
    html += '<th>' + months[m] + '</th>';
  }
  html += '</tr>';
  var keys = Object.keys(APP.vegetables);
  // LIGNES
  for (var i = 0; i < keys.length; i++) {
    var id = keys[i];
    var veg = APP.vegetables[id];
    if (!veg) continue;
    var cal = (typeof GeoCalendar !== 'undefined')
      ? GeoCalendar.getCalendarForVeggie(veg)
      : getPlantingCalendarForVeggie(veg);
    html += '<tr>';
    // Nom legume
    html += '<td style="text-align:left;padding:4px;">' +
      (veg.icon || '') + ' ' + escH(tVeg(veg.name)) +
    '</td>';
    // Mois
    for (var m2 = 1; m2 <= 12; m2++) {
      var plant = cal && cal.plantMonths && cal.plantMonths.indexOf(m2) >= 0;
      var harvest = cal && cal.harvestMonths && cal.harvestMonths.indexOf(m2) >= 0;
      var style = '';
      if (plant) {
        style = 'background:#4caf50;color:white;';
      } else if (harvest) {
        style = 'background:#ff9800;color:white;';
      }
      html += '<td style="padding:4px;' + style + '"></td>';
    }
    html += '</tr>';
  }
  html += '</table>';
  html += '<div style="margin-top:10px;font-size:0.75rem;color:var(--text-light);">';
  html += t('cal_planting_legend');
  html += '</div>';
  html += '</div></div>';
  return html;
}


function renderSimplePlantingCalendar() {
  var html = '<div class="forecast-section">';
  html += '<div class="section-title">' + t('cal_simple_title') + '</div>';
  html += '<div class="card">';
  html += '<div style="font-size:0.85rem;color:var(--text-light);margin-bottom:12px;">';
  html += t('cal_simple_desc');
  html += '</div>';
  for (var month = 1; month <= 12; month++) {
    var veggiesForMonth = [];
    var keys = Object.keys(APP.vegetables);
    for (var i = 0; i < keys.length; i++) {
      var id = keys[i];
      var veg = APP.vegetables[id];
      var cal = (typeof GeoCalendar !== 'undefined')
        ? GeoCalendar.getCalendarForVeggie(veg)
        : getPlantingCalendarForVeggie(veg);
      if (!veg || !cal || !cal.plantMonths) continue;
      if (cal.plantMonths.indexOf(month) >= 0) {
        veggiesForMonth.push({
          id: id,
          name: veg.name,
          icon: veg.icon
        });
      }
    }
    veggiesForMonth.sort(function(a, b) {
      return a.name.localeCompare(b.name, 'fr');
    });
    html += '<div class="timeline-month">📅 ' + getMonthLabel(month) + '</div>';
    if (veggiesForMonth.length === 0) {
      html += '<div style="font-size:0.8rem;color:var(--text-light);margin:6px 0 12px 0;">' + t('cal_no_veggie_month') + '</div>';
    } else {
      html += '<div style="margin-bottom:12px;">';
      for (var j = 0; j < veggiesForMonth.length; j++) {
        html += '<span class="badge badge-green" style="margin:2px;">' +
          veggiesForMonth[j].icon + ' ' + escH(tVeg(veggiesForMonth[j].name)) +
        '</span>';
      }
      html += '</div>';
    }
  }
  html += '</div>';
  html += '</div>';
  return html;
}
var VEGGIE_ENRICHI = {
  'Tomate': {
    conseils: ['Tuteurer des que la plante depasse 30cm', 'Supprimer les gourmands pour un meilleur rendement', 'Arroser regulierement, eviter les ecarts'],
    associations: { bons: ['Basilic','Carotte','Oignon','Persil','Ciboulette'], mauvais: ['Fenouil','Pomme de terre','Aubergine'] },
    maladies: [
      { icon: '🍂', nom: 'Mildiou', desc: 'Taches brunes sur feuilles et fruits. Eviter de mouiller le feuillage, aerez bien.' },
      { icon: '🦠', nom: 'Botrytis', desc: 'Moisissure grise. Supprimer les parties atteintes, reduire l\'humidite.' },
      { icon: '🐛', nom: 'Pucerons', desc: 'Feuilles enroulees, plante affaiblie. Traiter au savon noir dilue.' }
    ]
  },
  'Salade': {
    conseils: ['Recolter tot le matin pour plus de croquant', 'Planter a mi-ombre en ete pour eviter la montaison', 'Arroser le sol, pas les feuilles'],
    associations: { bons: ['Radis','Carotte','Fraise','Ciboulette'], mauvais: ['Persil','Celeri'] },
    maladies: [
      { icon: '🐌', nom: 'Limaces', desc: 'Feuilles trouees. Poser des pieges a biere ou cendres autour des plants.' },
      { icon: '🍂', nom: 'Mildiou', desc: 'Taches jaunes dessus, blanches dessous. Espacer les plants, bonne aeration.' }
    ]
  },
  'Carotte': {
    conseils: ['Semer clair pour eviter l\'eclaircissage', 'Sol profond et meuble sans cailloux', 'Ne pas mettre d\'engrais frais, ca bifurque'],
    associations: { bons: ['Poireau','Oignon','Salade','Tomate','Romarin'], mauvais: ['Aneth','Betterave'] },
    maladies: [
      { icon: '🪲', nom: 'Mouche de la carotte', desc: 'Galeries dans la racine. Couvrir d\'un voile anti-insectes apres semis.' },
      { icon: '🍂', nom: 'Alternariose', desc: 'Taches noires sur feuilles. Eviter l\'humidite excessive.' }
    ]
  },
  'Courgette': {
    conseils: ['Un seul plant suffit pour une famille', 'Recolter petite (15-20cm) pour meilleur gout', 'Polliniser a la main si peu d\'insectes'],
    associations: { bons: ['Haricot','Mais','Capucine','Oignon'], mauvais: ['Pomme de terre','Concombre'] },
    maladies: [
      { icon: '⬜', nom: 'Oidium', desc: 'Poudre blanche sur feuilles. Pulveriser du bicarbonate dilue, aerer.' },
      { icon: '🐛', nom: 'Pucerons', desc: 'Colonies sous les feuilles. Savon noir ou coccinelles.' }
    ]
  },
  'Haricot': {
    conseils: ['Ne pas semer avant 15°C dans le sol', 'Tuteurer les varietes grimpantes', 'Recolter souvent pour prolonger la production'],
    associations: { bons: ['Carotte','Chou','Concombre','Mais'], mauvais: ['Oignon','Ail','Pois','Fenouil'] },
    maladies: [
      { icon: '🦠', nom: 'Anthracnose', desc: 'Taches sombres sur gousses. Rotation obligatoire, semences saines.' },
      { icon: '🐛', nom: 'Bruche', desc: 'Larves dans les graines. Conserver au frais ou congeler 48h apres recolte.' }
    ]
  },
  'Radis': {
    conseils: ['Recolter vite (25-30 jours) avant qu\'ils deviennent creux', 'Semer echelonne toutes les 2 semaines', 'Utile comme culture de bordure repulsive'],
    associations: { bons: ['Carotte','Salade','Concombre','Tomate'], mauvais: ['Chou','Hyssope'] },
    maladies: [
      { icon: '🪲', nom: 'Altises', desc: 'Petits trous dans les feuilles. Couvrir d\'un voile, cendres autour.' }
    ]
  },
  'Basilic': {
    conseils: ['Pincer les fleurs des qu\'elles apparaissent', 'Ne jamais laisser la terre secher completement', 'Eviter de mettre en plein courant d\'air'],
    associations: { bons: ['Tomate','Poivron','Asperge'], mauvais: ['Sauge','Thym'] },
    maladies: [
      { icon: '🍂', nom: 'Fusariose', desc: 'Jaunissement et fletrissement. Pas de remede, retirer la plante.' },
      { icon: '🐛', nom: 'Pucerons', desc: 'Sous les feuilles. Savon noir ou jet d\'eau.' }
    ]
  },
  'Poivron': {
    conseils: ['Besoin de chaleur : attendre mai pour planter dehors', 'Tuteurer car les branches cassent facilement', 'Arroser regulierement pour eviter la pourriture apicale'],
    associations: { bons: ['Basilic','Carotte','Oignon','Courgette'], mauvais: ['Fenouil','Pomme de terre'] },
    maladies: [
      { icon: '⬛', nom: 'Pourriture apicale', desc: 'Fond du fruit noir. Carence en calcium + arrosage irregulier.' },
      { icon: '🐛', nom: 'Pucerons', desc: 'Feuilles deformees. Savon noir, coccinelles.' }
    ]
  },
  'Concombre': {
    conseils: ['Tuteurer verticalement pour gagner de la place', 'Recolter avant que les graines durcissent', 'Arroser chaud pour eviter le choc thermique'],
    associations: { bons: ['Haricot','Pois','Tournesol','Aneth'], mauvais: ['Tomate','Courgette','Pomme de terre'] },
    maladies: [
      { icon: '⬜', nom: 'Oidium', desc: 'Poudre blanche. Bicarbonate dilue, bonne aeration.' },
      { icon: '🍂', nom: 'Mildiou', desc: 'Taches angulaires jaunes. Eviter l\'humidite, aerez.' }
    ]
  },
  'Oignon': {
    conseils: ['Arreter d\'arroser quand les tiges tombent', 'Faire secher 2-3 semaines avant stockage', 'Planter pres des carottes contre la mouche'],
    associations: { bons: ['Carotte','Tomate','Laitue','Betterave'], mauvais: ['Pois','Haricot','Asperge'] },
    maladies: [
      { icon: '🍂', nom: 'Mildiou', desc: 'Taches grises sur feuilles. Rotation, ecartement suffisant.' },
      { icon: '🪲', nom: 'Mouche de l\'oignon', desc: 'Larves dans le bulbe. Voile anti-insectes, rotation.' }
    ]
  },
  'Ail': {
    conseils: ['Planter les caieux pointe vers le haut en automne', 'Ne pas arroser en fin de cycle quand les feuilles jaunissent', 'Recolter quand la moitie des feuilles est seche'],
    associations: { bons: ['Carotte','Tomate','Fraise','Rose'], mauvais: ['Pois','Haricot','Chou'] },
    maladies: [
      { icon: '🍂', nom: 'Rouille', desc: 'Pustules orangees sur feuilles. Supprimer feuilles atteintes, rotation.' },
      { icon: '🟤', nom: 'Pourriture blanche', desc: 'Bulbe pourri avec mycellium blanc. Sol bien draine, rotation longue.' }
    ]
  },
  'Echalote': {
    conseils: ['Planter en automne ou tot au printemps', 'Chaque bulbe produit 5 a 10 nouveaux bulbes', 'Laisser secher au soleil apres recolte avant stockage'],
    associations: { bons: ['Carotte','Tomate','Betterave'], mauvais: ['Pois','Haricot','Asperge'] },
    maladies: [
      { icon: '🍂', nom: 'Mildiou', desc: 'Feutrage gris-violet sur feuilles. Eviter humidite excessive.' },
      { icon: '🪲', nom: 'Thrips', desc: 'Stries argentees sur feuilles. Favoriser les auxiliaires.' }
    ]
  },
  'Poireau': {
    conseils: ['Repiquer quand le plant est de la taille d\'un crayon', 'Butter regulierement pour blanchir le fut', 'Tres resistant au gel, peut rester en terre tout l\'hiver'],
    associations: { bons: ['Carotte','Celeri','Tomate','Persil'], mauvais: ['Pois','Haricot','Betterave'] },
    maladies: [
      { icon: '🪲', nom: 'Teigne du poireau', desc: 'Galeries dans les feuilles. Filet anti-insectes des la plantation.' },
      { icon: '🍂', nom: 'Rouille', desc: 'Pustules jaunes orangees. Eviter l\'exces d\'azote, bonne aeration.' }
    ]
  },
  'Ciboulette': {
    conseils: ['Couper ras pour stimuler la repousse', 'Diviser la touffe tous les 3 ans pour la revigorer', 'Les fleurs sont aussi comestibles et decoratives'],
    associations: { bons: ['Carotte','Tomate','Rose','Fraise'], mauvais: ['Pois','Haricot'] },
    maladies: [
      { icon: '🍂', nom: 'Rouille', desc: 'Taches orange sur feuilles. Supprimer feuilles, bonne aeration.' }
    ]
  },
  'Epinard': {
    conseils: ['Semer en rangs espaces de 20cm', 'Recolter les grandes feuilles exterieures d\'abord', 'Monte vite a la graine l\'ete : semer au printemps et en automne'],
    associations: { bons: ['Fraise','Pois','Celeri','Chou'], mauvais: ['Betterave','Blette'] },
    maladies: [
      { icon: '🍂', nom: 'Mildiou', desc: 'Duvet blanc-gris sous les feuilles. Espacer les plants, bonne aeration.' },
      { icon: '🪲', nom: 'Mineuse des feuilles', desc: 'Galeries dans les feuilles. Retirer et bruler les feuilles atteintes.' }
    ]
  },
  'Betterave': {
    conseils: ['Eclaircir a 10cm apres levee', 'Recolter avant 8cm de diametre pour meilleur gout', 'Les fanes se cuisinent comme des blettes'],
    associations: { bons: ['Salade','Oignon','Chou','Kohlrabi'], mauvais: ['Haricot','Epinard','Blette'] },
    maladies: [
      { icon: '🍂', nom: 'Cercosporiose', desc: 'Taches brunes a bord rouge sur feuilles. Rotation, varietes resistantes.' },
      { icon: '🪲', nom: 'Puceron noir de la feve', desc: 'Colonies sur feuilles. Savon noir, favoriser auxiliaires.' }
    ]
  },
  'Blette': {
    conseils: ['Recolter les feuilles exterieures pendant toute la belle saison', 'Tres productive : un seul rang suffit pour une famille', 'Tolere la mi-ombre mieux que la plupart des legumes'],
    associations: { bons: ['Haricot','Chou','Oignon'], mauvais: ['Epinard','Betterave','Pomme de terre'] },
    maladies: [
      { icon: '🍂', nom: 'Mildiou', desc: 'Feuilles jaunes et fletrissures. Bonne aeration et espacement.' },
      { icon: '🐌', nom: 'Limaces', desc: 'Feuilles trouees surtout les jeunes plants. Pieges, cendres.' }
    ]
  },
  'Mache': {
    conseils: ['Semer a la volee en aout-septembre pour une recolte hivernale', 'Tres tolerante au gel, ideal pour combler les espaces vides en automne', 'Recolter en rosette entiere ou en coupant les feuilles'],
    associations: { bons: ['Radis','Carotte','Epinard'], mauvais: [] },
    maladies: [
      { icon: '🐌', nom: 'Limaces', desc: 'Rosettes devorees. Pieges a biere, granules anti-limaces bio.' }
    ]
  },
  'Roquette': {
    conseils: ['Recolter jeune pour moins d\'amertume', 'Semer tous les 15 jours pour etalement de la recolte', 'Monte vite en graine par chaleur : privilegier printemps et automne'],
    associations: { bons: ['Carotte','Haricot','Tomate'], mauvais: ['Chou','Navet'] },
    maladies: [
      { icon: '🪲', nom: 'Altises', desc: 'Petits trous ronds dans les feuilles. Voile anti-insectes, cendres.' }
    ]
  },
  'Navet': {
    conseils: ['Semer en place, ne supporte pas le repiquage', 'Eclaircir a 15cm pour les navets de conservation', 'Recolter jeune pour les navets primeurs'],
    associations: { bons: ['Pois','Haricot','Salade'], mauvais: ['Radis','Chou-fleur','Moutarde'] },
    maladies: [
      { icon: '🪲', nom: 'Altises', desc: 'Trous dans les feuilles. Voile anti-insectes apres semis.' },
      { icon: '🟤', nom: 'Hernie du chou', desc: 'Renflements sur racines. Rotation 5 ans min sur sol calcaire.' }
    ]
  },
  'Chou': {
    conseils: ['Planter profond pour une tige solide', 'Proteger avec un filet contre les papillons blancs', 'Recolter apres les premieres gelees pour plus de saveur'],
    associations: { bons: ['Haricot','Celeri','Sauge','Aneth','Pomme de terre'], mauvais: ['Tomate','Fraise','Ail'] },
    maladies: [
      { icon: '🟤', nom: 'Hernie du chou', desc: 'Grosseurs sur racines. Chauler le sol, rotation longue.' },
      { icon: '🦋', nom: 'Pieride du chou', desc: 'Chenilles vert pales devorant les feuilles. Filet, Bt.' },
      { icon: '🪲', nom: 'Altises', desc: 'Nombreux petits trous sur feuilles. Voile anti-insectes.' }
    ]
  },
  'Chou-fleur': {
    conseils: ['Replier les feuilles sur le chou-fleur pour le blanchir', 'Arroser regulierement : le stress hydrique donne des pommes floconneuses', 'Recolter quand la pomme est bien serree'],
    associations: { bons: ['Celeri','Aneth','Sauge','Camomille'], mauvais: ['Tomate','Fraise','Ail'] },
    maladies: [
      { icon: '🦋', nom: 'Pieride du chou', desc: 'Chenilles verts clair. Filet anti-insectes, Bt.' },
      { icon: '🟤', nom: 'Hernie du chou', desc: 'Renflements radiculaires. Sol calcaire, rotation stricte.' }
    ]
  },
  'Brocoli': {
    conseils: ['Couper la tete principale avant floraison pour stimuler les jets lateraux', 'Tres riche en vitamines : consommer frais apres recolte', 'Planter a mi-saison pour recolte automnale'],
    associations: { bons: ['Celeri','Salade','Aneth','Oignon'], mauvais: ['Tomate','Piment','Haricot'] },
    maladies: [
      { icon: '🦋', nom: 'Pieride du chou', desc: 'Chenilles sur feuilles. Filet, Bt.' },
      { icon: '🍂', nom: 'Mildiou', desc: 'Feutrage blanc-gris. Aeration, espacer les plants.' }
    ]
  },
  'Chou rouge': {
    conseils: ['Necessite une longue periode de croissance, planter tot', 'Resiste bien aux premiers froids', 'Le vinaigre fixe sa belle couleur rouge a la cuisson'],
    associations: { bons: ['Aneth','Sauge','Pomme de terre'], mauvais: ['Tomate','Fraise'] },
    maladies: [
      { icon: '🦋', nom: 'Pieride du chou', desc: 'Chenilles verts. Filet anti-insectes, Bt.' }
    ]
  },
  'Chou de Bruxelles': {
    conseils: ['Planter en mai pour recolte de novembre a fevrier', 'Ebrancher le bas de la tige au fur et a mesure que les choux se forment', 'Les premieres gelees ameliorent le gout'],
    associations: { bons: ['Aneth','Sauge','Celeri'], mauvais: ['Tomate','Fraise','Ail'] },
    maladies: [
      { icon: '🦋', nom: 'Pieride du chou', desc: 'Chenilles devorant feuilles et choux. Filet, Bt.' },
      { icon: '🟤', nom: 'Hernie du chou', desc: 'Racines deformees. Chauler, rotation 5 ans.' }
    ]
  },
  'Aubergine': {
    conseils: ['Besoin de chaleur : ne pas planter avant mai en pleine terre', 'Tuteurer pour eviter que les branches chargees cassent', 'Pincer apres 4-5 fruits formes pour favoriser leur grossissement'],
    associations: { bons: ['Basilic','Poivron','Persil'], mauvais: ['Fenouil','Pomme de terre'] },
    maladies: [
      { icon: '🐛', nom: 'Pucerons', desc: 'Colonies sous feuilles. Savon noir dilue.' },
      { icon: '🕷️', nom: 'Acariens', desc: 'Feuilles bronzees par chaleur seche. Vaporiser de l\'eau sur le feuillage.' }
    ]
  },
  'Piment': {
    conseils: ['Meme culture que le poivron mais encore plus exigeante en chaleur', 'Peut hiverner en interieur comme plante vivace', 'Plus le fruit murit, plus il est fort'],
    associations: { bons: ['Basilic','Carotte','Oignon'], mauvais: ['Fenouil','Pomme de terre'] },
    maladies: [
      { icon: '🐛', nom: 'Pucerons', desc: 'Colonies sous feuilles. Savon noir.' },
      { icon: '🕷️', nom: 'Acariens', desc: 'Par temps chaud et sec. Vaporiser d\'eau, insecticide bio.' }
    ]
  },
  'Pomme de terre': {
    conseils: ['Butter regulierement pour eviter le verdissement des tubercules', 'Ne pas replanter sur la meme parcelle avant 3-4 ans', 'Faire prechauffer les plants avant plantation'],
    associations: { bons: ['Haricot','Chou','Mais','Persil'], mauvais: ['Tomate','Aubergine','Concombre','Citrouille'] },
    maladies: [
      { icon: '🍂', nom: 'Mildiou', desc: 'Taches brunes sur feuilles et tiges. Bouillie bordelaise preventive.' },
      { icon: '🪲', nom: 'Doryphore', desc: 'Larves oranges devorant le feuillage. Ramasser a la main, Bt, rotation.' }
    ]
  },
  'Patate douce': {
    conseils: ['Necessite un ete chaud et long : ideal dans le Sud', 'Planter les boutures en mai-juin', 'Recolter avant les premieres gelees : les feuilles noircissent'],
    associations: { bons: ['Haricot','Courge','Mais'], mauvais: ['Pomme de terre','Tomate'] },
    maladies: [
      { icon: '🐛', nom: 'Charanceon de la patate douce', desc: 'Larves dans les tubercules. Rotation, surveiller les plants.' }
    ]
  },
  'Persil': {
    conseils: ['Tremper les graines 24h avant semis pour accelerer la germination', 'Proteger en hiver avec un voile pour recolter toute l\'annee', 'Couper les tiges fleuries pour prolonger la production'],
    associations: { bons: ['Tomate','Asperge','Poireau','Carotte'], mauvais: ['Salade','Celeri','Oignon'] },
    maladies: [
      { icon: '🪲', nom: 'Mouche du persil', desc: 'Galeries dans les feuilles. Voile anti-insectes.' },
      { icon: '🍂', nom: 'Septoriose', desc: 'Taches jaunes sur feuilles. Supprimer feuilles, bonne aeration.' }
    ]
  },
  'Panais': {
    conseils: ['Semer en place tot au printemps, ne tolere pas le repiquage', 'Sol profond et sans cailloux comme pour les carottes', 'Le gout se bonifie apres les gelees'],
    associations: { bons: ['Pois','Haricot','Radis'], mauvais: ['Carotte','Celeri'] },
    maladies: [
      { icon: '🍂', nom: 'Mildiou', desc: 'Feuilles jaunes. Rotation, bonne aeration.' },
      { icon: '🪲', nom: 'Mouche de la carotte', desc: 'Aussi attaquee. Voile anti-insectes.' }
    ]
  },
  'Celeri-rave': {
    conseils: ['Demarrer en interieur 3 mois avant repiquage', 'Garder la couronne degagee de terre pour un beau legume', 'Arroser regulierement : craint le manque d\'eau'],
    associations: { bons: ['Poireau','Tomate','Salade','Haricot'], mauvais: ['Mais','Pomme de terre'] },
    maladies: [
      { icon: '🍂', nom: 'Septoriose', desc: 'Taches brunes sur feuilles. Supprimer feuilles, rotation.' },
      { icon: '🪲', nom: 'Mouche du celeri', desc: 'Galeries dans les feuilles. Voile anti-insectes.' }
    ]
  },
  'Celeri branche': {
    conseils: ['Blanchir en emmaillotant les tiges 2 semaines avant recolte pour adoucir le gout', 'Tres gourmand en eau : pailler abondamment', 'Peut se cultiver en jardiniere si arrosage regulier'],
    associations: { bons: ['Poireau','Tomate','Chou','Haricot'], mauvais: ['Mais','Pomme de terre','Carotte'] },
    maladies: [
      { icon: '🍂', nom: 'Septoriose', desc: 'Taches brunes sur feuilles. Rotation, supprimer feuilles atteintes.' }
    ]
  },
  'Fenouil': {
    conseils: ['Isoler car il inhibe la croissance de nombreux voisins', 'Butter le bulbe pour le blanchir et adoucir le gout', 'Recolter avant que le bulbe parte en graine'],
    associations: { bons: ['Aneth'], mauvais: ['Tomate','Poivron','Haricot','Carotte','Courgette'] },
    maladies: [
      { icon: '🐛', nom: 'Pucerons du fenouil', desc: 'Colonies blanches sur tiges. Savon noir dilue.' }
    ]
  },
  'Aneth': {
    conseils: ['Semer directement en place, n\'aime pas le repiquage', 'Laisser quelques plants monter en graine pour ressemer naturellement', 'Recolter les feuilles jeunes avant la floraison'],
    associations: { bons: ['Concombre','Carotte','Chou'], mauvais: ['Tomate','Fenouil'] },
    maladies: [
      { icon: '🐛', nom: 'Pucerons', desc: 'Colonies sur tiges florales. Savon noir.' }
    ]
  },
  'Coriandre': {
    conseils: ['Semer en place, craint le repiquage', 'Monte vite en graine par chaleur : privilegier printemps et automne', 'Recolter tot le matin pour plus d\'arome'],
    associations: { bons: ['Carotte','Chou','Tomate'], mauvais: ['Fenouil'] },
    maladies: [
      { icon: '🪲', nom: 'Altises', desc: 'Petits trous dans les feuilles. Voile anti-insectes.' }
    ]
  },
  'Estragon': {
    conseils: ['Preferer l\'estragon francais (plus aromatique) a l\'estragon russe', 'Se multiplie facilement par division ou bouturage', 'Couper les tiges pour eviter la montaison'],
    associations: { bons: ['Tomate','Aubergine','Poivron'], mauvais: [] },
    maladies: [
      { icon: '🍂', nom: 'Rouille', desc: 'Pustules orangees sous feuilles. Supprimer feuilles, ameliorer drainage.' }
    ]
  },
  'Menthe': {
    conseils: ['Planter en pot ou avec une barriere car tres envahissante', 'Tailler apres floraison pour stimuler la repousse', 'Se recolte toute l\'annee sous abri'],
    associations: { bons: ['Chou','Tomate','Pois','Carotte'], mauvais: ['Persil','Camomille'] },
    maladies: [
      { icon: '🍂', nom: 'Rouille', desc: 'Pustules orangees sur feuilles. Couper ras et bruler les tiges atteintes.' }
    ]
  },
  'Thym': {
    conseils: ['Tailler apres floraison pour eviter la lignification', 'Tres resistant a la secheresse : peu arroser', 'Repulsif naturel contre de nombreux insectes ravageurs'],
    associations: { bons: ['Chou','Tomate','Aubergine','Poivron'], mauvais: ['Basilic'] },
    maladies: [
      { icon: '🍂', nom: 'Botrytis', desc: 'Moisissure grise sur tiges. Tailler, bonne aeration, sol bien draine.' }
    ]
  },
  'Romarin': {
    conseils: ['Planter en sol bien draine, craint l\'eau stagnante', 'Proteger du grand froid sous les climates froids', 'Tailler legerement apres floraison'],
    associations: { bons: ['Chou','Haricot','Carotte','Sauge'], mauvais: [] },
    maladies: [
      { icon: '🍂', nom: 'Pourriture des racines', desc: 'Sol trop humide. Planter en sol tres draine, eviter les arrosages excessifs.' }
    ]
  },
  'Sauge': {
    conseils: ['Excellent repulsif contre les insectes du chou', 'Tailler apres floraison, eviter le bois trop age', 'Multiplier par bouturage en ete'],
    associations: { bons: ['Chou','Tomate','Carotte','Romarin'], mauvais: ['Basilic','Oignon'] },
    maladies: [
      { icon: '⬜', nom: 'Oidium', desc: 'Poudre blanche sur feuilles. Bicarbonate dilue, bonne aeration.' }
    ]
  },
  'Origan': {
    conseils: ['Tres peu gourmand en entretien, tolere la secheresse', 'Le secher en bouquet a l\'ombre pour conserver tout son arome', 'Envahissant : contenir avec des bordures'],
    associations: { bons: ['Tomate','Poivron','Courgette'], mauvais: [] },
    maladies: [
      { icon: '🍂', nom: 'Rouille', desc: 'Pustules sur feuilles. Supprimer feuilles, bonne aeration.' }
    ]
  },
  'Melon': {
    conseils: ['Pincer l\'extremite des tiges apres 2 melons noues par tige', 'Glisser une ardoise sous les fruits pour eviter la pourriture', 'Recolter quand une petite fissure circulaire apparait a la base du pedoncule'],
    associations: { bons: ['Mais','Haricot','Radis'], mauvais: ['Pomme de terre','Concombre','Courgette'] },
    maladies: [
      { icon: '⬜', nom: 'Oidium', desc: 'Poudre blanche sur feuilles. Bicarbonate dilue.' },
      { icon: '🍂', nom: 'Mildiou', desc: 'Taches angulaires jaunes. Eviter arrosage sur feuilles.' }
    ]
  },
  'Potiron': {
    conseils: ['Laisser un seul plant par butte avec beaucoup de compost', 'Couper les tiges secondaires apres 3-4 fruits', 'Laisser durcir le pedoncule avant recolte pour la conservation'],
    associations: { bons: ['Mais','Haricot','Capucine'], mauvais: ['Pomme de terre','Concombre'] },
    maladies: [
      { icon: '⬜', nom: 'Oidium', desc: 'Feutrage blanc en fin de saison. Recolter avant generalisation.' }
    ]
  },
  'Potimarron': {
    conseils: ['Se conserve tres bien : jusqu\'a 6 mois dans un endroit frais et sec', 'Se mange avec la peau, tres pratique', 'Croissance vigoureuse : prevoir beaucoup d\'espace'],
    associations: { bons: ['Mais','Haricot','Capucine'], mauvais: ['Pomme de terre','Concombre'] },
    maladies: [
      { icon: '⬜', nom: 'Oidium', desc: 'Fin de saison. Recolter avant generalisation.' }
    ]
  },
  'Courge butternut': {
    conseils: ['La peau doit etre beige caramel et dure a la recolte', 'Conserver dans un endroit sec a 12-15°C jusqu\'a 3 mois', 'Planter en butte avec du compost abondant'],
    associations: { bons: ['Mais','Haricot','Capucine','Oignon'], mauvais: ['Pomme de terre'] },
    maladies: [
      { icon: '⬜', nom: 'Oidium', desc: 'Poudre blanche. Traiter au bicarbonate, recolter a temps.' }
    ]
  },
  'Pasteque': {
    conseils: ['Culture de chaleur : ideal dans le Midi', 'Frotter l\'oreille contre le fruit : un son sourd indique la maturite', 'Limiter a 2-3 fruits par plant pour de belles tailles'],
    associations: { bons: ['Mais','Haricot','Radis'], mauvais: ['Pomme de terre','Concombre'] },
    maladies: [
      { icon: '🍂', nom: 'Mildiou', desc: 'Taches foliaires. Bonne aeration, eviter humidite sur feuilles.' }
    ]
  },
  'Haricot vert': {
    conseils: ['Recolter tres regulierement pour prolonger la production', 'Ne pas semer avant que la terre soit a 15°C minimum', 'Arroser au pied pour eviter les maladies'],
    associations: { bons: ['Carotte','Chou','Concombre','Mais'], mauvais: ['Oignon','Ail','Fenouil'] },
    maladies: [
      { icon: '🦠', nom: 'Anthracnose', desc: 'Taches noires sur gousses. Rotation, semences saines.' },
      { icon: '🐛', nom: 'Bruche', desc: 'Insectes dans les graines. Conserver en chambre froide.' }
    ]
  },
  'Feve': {
    conseils: ['Planter en automne pour une recolte tot au printemps', 'Pincer l\'extremite des tiges quand les premieres gousses se forment', 'Les jeunes feuilles et les fleurs sont aussi comestibles'],
    associations: { bons: ['Chou','Pomme de terre','Carotte','Epinard'], mauvais: ['Oignon','Ail','Fenouil'] },
    maladies: [
      { icon: '🪲', nom: 'Puceron noir', desc: 'Colonies sur extremites des tiges. Pincer les tiges, savon noir.' },
      { icon: '🍂', nom: 'Botrytis', desc: 'Moisissure grise sur gousses par humidite. Espacer les plants.' }
    ]
  },
  'Petit pois': {
    conseils: ['Semer tot au printemps ou en automne : craint la chaleur', 'Tuteurer avec des branchages ou un filet', 'Recolter avant que les grains durcissent pour meilleur gout'],
    associations: { bons: ['Carotte','Navet','Radis','Salade'], mauvais: ['Oignon','Ail','Echalote'] },
    maladies: [
      { icon: '⬜', nom: 'Oidium', desc: 'Poudre blanche sur tiges et feuilles. Bicarbonate, bonne aeration.' },
      { icon: '🐛', nom: 'Sitone', desc: 'Encoches semi-circulaires sur feuilles. Peu grave en general.' }
    ]
  },
  'Pois mange-tout': {
    conseils: ['Se mange gousse et grains ensemble quand la gousse est plate', 'Tuteurer des 15cm de haut', 'Semer tot au printemps ou en automne pour recolte en juin'],
    associations: { bons: ['Carotte','Navet','Radis'], mauvais: ['Oignon','Ail','Echalote'] },
    maladies: [
      { icon: '⬜', nom: 'Oidium', desc: 'Poudre blanche sur tiges. Bicarbonate, espacer les plants.' }
    ]
  },
  'Mais doux': {
    conseils: ['Planter en bloc plutot qu\'en rang pour une bonne pollinisation', 'Recolter quand les soies sont brunes et le grain bien forme', 'Excellent compagnon pour courge et haricots (les trois soeurs)'],
    associations: { bons: ['Haricot','Courge','Concombre','Courgette'], mauvais: ['Tomate','Betterave'] },
    maladies: [
      { icon: '🪲', nom: 'Pyrale du mais', desc: 'Galeries dans les tiges. Bt, detruire les tiges apres recolte.' }
    ]
  },
  'Fraise': {
    conseils: ['Supprimer les stolons sauf pour le renouvellement des plants', 'Mulcher avec de la paille pour eviter les eclaboussures', 'Renouveler les plants tous les 3 ans'],
    associations: { bons: ['Salade','Oignon','Ciboulette','Ail','Epinard'], mauvais: ['Chou','Fenouil','Pois'] },
    maladies: [
      { icon: '🍂', nom: 'Botrytis', desc: 'Moisissure grise sur fruits. Eviter l\'humidite, supprimer fruits atteints.' },
      { icon: '🐛', nom: 'Pucerons', desc: 'Feuilles enroulees. Savon noir, auxiliaires.' },
      { icon: '🐌', nom: 'Limaces', desc: 'Fruits troues. Pieges, cendres, barriere cuivre.' }
    ]
  },
  'Framboise': {
    conseils: ['Couper les tiges ayant fructifie a la base en fin de saison', 'Ligaturer les nouvelles tiges sur un support', 'Paillez abondamment pour conserver l\'humidite'],
    associations: { bons: ['Tanaisie','Persil','Ail'], mauvais: ['Pomme de terre','Tomate'] },
    maladies: [
      { icon: '🍂', nom: 'Botrytis', desc: 'Moisissure grise sur fruits. Bonne aeration, supprimer tiges mortes.' },
      { icon: '🪲', nom: 'Cetoine', desc: 'Larves dans la base des tiges. Ramasser les adultes.' }
    ]
  },
  'Artichaut': {
    conseils: ['Proteger les pieds avec un paillis epais en hiver dans les regions froides', 'Supprimer les rejets en laissant 2-3 tetes par plant', 'Recolter les capitules avant que les ecailles s\'ecartent'],
    associations: { bons: ['Pois','Laitue','Carotte'], mauvais: ['Pomme de terre'] },
    maladies: [
      { icon: '🐛', nom: 'Pucerons gris', desc: 'Colonies au coeur du capitule. Savon noir, traiter tot.' },
      { icon: '🍂', nom: 'Botrytis', desc: 'Moisissure sur feuilles. Supprimer feuilles, bonne aeration.' }
    ]
  },
  'Topinambour': {
    conseils: ['Peut devenir envahissant : planter avec une barriere', 'Tres facile : pousse dans les sols pauvres et a mi-ombre', 'Laisser des tubercules en terre pour une replantation naturelle'],
    associations: { bons: ['Mais','Courge','Haricot'], mauvais: [] },
    maladies: []
  },
  'Asperge': {
    conseils: ['Patience : ne pas recolter les 2 premieres annees pour laisser la plante s\'installer', 'Planter les griffes dans une tranchee profonde (30cm) avec du compost', 'Arreter la recolte en juin pour laisser les tiges reprendre de la vigueur'],
    associations: { bons: ['Tomate','Persil','Basilic'], mauvais: ['Oignon','Ail','Pomme de terre'] },
    maladies: [
      { icon: '🦠', nom: 'Rouille de l\'asperge', desc: 'Taches orange sur tiges. Varietes resistantes, supprimer tiges atteintes.' }
    ]
  },
  'Radis noir': {
    conseils: ['Semer de juillet a septembre pour recolte automnale', 'Se conserve plusieurs mois en cave dans du sable', 'Raper et saler 30min avant consommation pour adoucir le piquant'],
    associations: { bons: ['Carotte','Salade','Concombre'], mauvais: ['Chou','Hyssope'] },
    maladies: [
      { icon: '🪲', nom: 'Altises', desc: 'Petits trous dans les feuilles. Voile anti-insectes.' }
    ]
  },
  'Cresson': {
    conseils: ['Necessite beaucoup d\'eau : cultiver pres d\'un point d\'eau ou arroser tres regulierement', 'Peut se cultiver en pot avec une soucoupe toujours pleine d\'eau', 'Recolter les tiges avant la floraison pour plus d\'arome'],
    associations: { bons: ['Menthe','Radis'], mauvais: [] },
    maladies: [
      { icon: '🐌', nom: 'Limaces', desc: 'Feuilles trouees. Pieges, cendres.' }
    ]
  },
  'Kale': {
    conseils: ['Recolter les feuilles du bas vers le haut en laissant le bourgeon apical', 'Resiste au gel et continue a pousser en hiver', 'Les jeunes feuilles sont moins ameres'],
    associations: { bons: ['Celeri','Aneth','Sauge','Oignon'], mauvais: ['Tomate','Fraise'] },
    maladies: [
      { icon: '🦋', nom: 'Pieride du chou', desc: 'Chenilles verts. Filet anti-insectes, Bt.' },
      { icon: '🪲', nom: 'Altises', desc: 'Petits trous dans les feuilles. Voile anti-insectes.' }
    ]
  },
  'Pak choi': {
    conseils: ['Culture rapide : pret a recolter en 6 semaines', 'Monte vite en graine par chaleur : semer au printemps ou en automne', 'Peut se recolter en baby leaf des 3 semaines'],
    associations: { bons: ['Celeri','Aneth','Oignon'], mauvais: ['Tomate','Fraise'] },
    maladies: [
      { icon: '🪲', nom: 'Altises', desc: 'Petits trous dans les feuilles. Voile anti-insectes.' }
    ]
  },
  'Chicor\u00e9e': {
    conseils: ['Tolere la chaleur mieux que la salade', 'L\'amertume diminue a la cuisson', 'Peut se forcer en cave pour obtenir des chicons comme l\'endive'],
    associations: { bons: ['Radis','Carotte'], mauvais: [] },
    maladies: [
      { icon: '🐌', nom: 'Limaces', desc: 'Feuilles trouees. Pieges, cendres.' }
    ]
  },
  'Endive': {
    conseils: ['Semer en mai-juin, deraciner en automne, forcer en cave dans le noir', 'Couper les feuilles a 2cm du collet avant le forcage', 'Le forcage dure 3-4 semaines a l\'obscurite totale'],
    associations: { bons: ['Radis','Carotte'], mauvais: [] },
    maladies: [
      { icon: '🍂', nom: 'Botrytis', desc: 'Pourriture pendant le forcage. Limiter l\'humidite.' }
    ]
  },
  'Groseille': {
    conseils: ['Tailler juste apres la recolte pour favoriser les jeunes rameaux fructiferes', 'Recolter quand les fruits sont pleinement colores', 'Tres productive une fois installee'],
    associations: { bons: ['Tanaisie','Ail'], mauvais: ['Framboise'] },
    maladies: [
      { icon: '🍂', nom: 'Botrytis', desc: 'Moisissure sur fruits par temps humide. Supprimer fruits momifies, tailler.' },
      { icon: '⬜', nom: 'Oidium', desc: 'Feutrage blanc sur feuilles. Traitement bicarbonate ou soufre.' }
    ]
  }
};

// ---- English translations for VEGGIE_ENRICHI content ----
var VEGGIE_ENRICHI_EN = {
  'Tomate': {
    conseils: ['Stake the plant once it exceeds 30 cm', 'Remove suckers for a better yield', 'Water regularly — avoid inconsistency'],
    maladies: [
      { icon: '🍂', nom: 'Late blight', desc: 'Brown spots on leaves and fruits. Avoid wetting foliage; ensure good airflow.' },
      { icon: '🦠', nom: 'Grey mould (Botrytis)', desc: 'Grey fuzzy mould. Remove affected parts and reduce humidity.' },
      { icon: '🐛', nom: 'Aphids', desc: 'Curled leaves, weakened plant. Spray with diluted black soap.' }
    ]
  },
  'Salade': {
    conseils: ['Harvest early morning for crunchiness', 'Plant in partial shade in summer to prevent bolting', 'Water the soil, not the leaves'],
    maladies: [
      { icon: '🐌', nom: 'Slugs', desc: 'Holes in leaves. Set beer traps or scatter ash around plants.' },
      { icon: '🍂', nom: 'Downy mildew', desc: 'Yellow patches on top, white below. Space plants well for good airflow.' }
    ]
  },
  'Carotte': {
    conseils: ['Sow thinly to avoid thinning later', 'Deep, loose, stone-free soil for straight carrots', 'Avoid fresh manure — it causes forking'],
    maladies: [
      { icon: '🪲', nom: 'Carrot fly', desc: 'Tunnels in the root. Cover with insect-proof fleece after sowing.' },
      { icon: '🍂', nom: 'Alternaria blight', desc: 'Black spots on leaves. Avoid excess moisture.' }
    ]
  },
  'Courgette': {
    conseils: ['One plant is enough for a family', 'Harvest small (15–20 cm) for best flavour', 'Hand-pollinate if few insects are present'],
    maladies: [
      { icon: '⬜', nom: 'Powdery mildew', desc: 'White powder on leaves. Spray diluted baking soda and ensure airflow.' },
      { icon: '🐛', nom: 'Aphids', desc: 'Colonies under leaves. Use black soap or attract ladybirds.' }
    ]
  },
  'Haricot': {
    conseils: ['Do not sow until soil reaches 15 °C', 'Stake climbing varieties', 'Harvest often to extend production'],
    maladies: [
      { icon: '🦠', nom: 'Anthracnose', desc: 'Dark spots on pods. Rotate crops, use clean seed.' },
      { icon: '🐛', nom: 'Bean weevil', desc: 'Larvae inside seeds. Store in a cool place or freeze for 48 h after harvest.' }
    ]
  },
  'Radis': {
    conseils: ['Harvest quickly (25–30 days) before they become hollow', 'Sow in succession every 2 weeks', 'Useful as a border crop to deter pests'],
    maladies: [
      { icon: '🪲', nom: 'Flea beetles', desc: 'Small holes in leaves. Cover with fleece; sprinkle ash around plants.' }
    ]
  },
  'Basilic': {
    conseils: ['Pinch flowers as soon as they appear', 'Never let the soil dry out completely', 'Avoid placing in strong drafts'],
    maladies: [
      { icon: '🍂', nom: 'Fusarium wilt', desc: 'Yellowing and wilting. No cure — remove the plant.' },
      { icon: '🐛', nom: 'Aphids', desc: 'Under leaves. Black soap or water jet.' }
    ]
  },
  'Poivron': {
    conseils: ['Needs warmth — wait until May to plant outside', 'Stake as branches snap easily', 'Water regularly to prevent blossom-end rot'],
    maladies: [
      { icon: '⬛', nom: 'Blossom-end rot', desc: 'Black base of fruit. Calcium deficiency + irregular watering.' },
      { icon: '🐛', nom: 'Aphids', desc: 'Distorted leaves. Black soap, ladybirds.' }
    ]
  },
  'Concombre': {
    conseils: ['Train vertically to save space', 'Harvest before seeds harden', 'Use warm water to avoid cold stress'],
    maladies: [
      { icon: '⬜', nom: 'Powdery mildew', desc: 'White powder. Diluted baking soda, good ventilation.' },
      { icon: '🍂', nom: 'Downy mildew', desc: 'Angular yellow patches. Avoid moisture, improve airflow.' }
    ]
  },
  'Oignon': {
    conseils: ['Stop watering when the stems flop over', 'Dry for 2–3 weeks before storing', 'Plant near carrots to deter carrot fly'],
    maladies: [
      { icon: '🍂', nom: 'Downy mildew', desc: 'Grey patches on leaves. Rotate; space plants adequately.' },
      { icon: '🪲', nom: 'Onion fly', desc: 'Larvae in the bulb. Insect-proof fleece, rotation.' }
    ]
  },
  'Ail': {
    conseils: ['Plant cloves point-up in autumn', 'Stop watering at the end of the cycle as leaves yellow', 'Harvest when half the leaves are dry'],
    maladies: [
      { icon: '🍂', nom: 'Rust', desc: 'Orange pustules on leaves. Remove affected leaves; rotate crops.' },
      { icon: '🟤', nom: 'White rot', desc: 'Rotting bulb with white mycelium. Well-drained soil; long rotation.' }
    ]
  },
  'Echalote': {
    conseils: ['Plant in autumn or early spring', 'Each bulb produces 5–10 new bulbs', 'Sun-dry after harvest before storing'],
    maladies: [
      { icon: '🍂', nom: 'Downy mildew', desc: 'Grey-purple fuzz on leaves. Avoid excess moisture.' },
      { icon: '🪲', nom: 'Thrips', desc: 'Silver streaks on leaves. Encourage beneficial insects.' }
    ]
  },
  'Poireau': {
    conseils: ['Transplant when seedlings are pencil-thick', 'Earth up regularly to blanch the stem', 'Very frost-hardy — can stay in the ground all winter'],
    maladies: [
      { icon: '🪲', nom: 'Leek moth', desc: 'Tunnels in leaves. Insect-proof netting from planting.' },
      { icon: '🍂', nom: 'Rust', desc: 'Yellow-orange pustules. Avoid excess nitrogen; improve airflow.' }
    ]
  },
  'Ciboulette': {
    conseils: ['Cut right down to stimulate regrowth', 'Divide clumps every 3 years to rejuvenate', 'Flowers are also edible and decorative'],
    maladies: [
      { icon: '🍂', nom: 'Rust', desc: 'Orange spots on leaves. Remove affected leaves; good airflow.' }
    ]
  },
  'Epinard': {
    conseils: ['Sow in rows spaced 20 cm apart', 'Harvest outer leaves first', 'Bolts quickly in summer — sow in spring and autumn'],
    maladies: [
      { icon: '🍂', nom: 'Downy mildew', desc: 'White-grey fuzz under leaves. Space plants well; good ventilation.' },
      { icon: '🪲', nom: 'Leaf miner', desc: 'Tunnels inside leaves. Remove and destroy affected leaves.' }
    ]
  },
  'Betterave': {
    conseils: ['Thin to 10 cm after germination', 'Harvest before 8 cm diameter for best flavour', 'The leaves can be cooked like Swiss chard'],
    maladies: [
      { icon: '🍂', nom: 'Cercospora leaf spot', desc: 'Brown spots with red borders on leaves. Rotate crops; use resistant varieties.' },
      { icon: '🪲', nom: 'Black bean aphid', desc: 'Colonies on leaves. Black soap; attract beneficial insects.' }
    ]
  },
  'Blette': {
    conseils: ['Harvest outer leaves throughout the growing season', 'Very productive — one row is enough for a family', 'Tolerates partial shade better than most vegetables'],
    maladies: [
      { icon: '🍂', nom: 'Downy mildew', desc: 'Yellow leaves and wilting. Good airflow and spacing.' },
      { icon: '🐌', nom: 'Slugs', desc: 'Holes in leaves, especially young plants. Traps; ash.' }
    ]
  },
  'Mache': {
    conseils: ['Broadcast sow in August–September for a winter harvest', 'Very frost-tolerant — ideal for filling gaps in autumn', 'Harvest as whole rosettes or by cutting leaves'],
    maladies: [
      { icon: '🐌', nom: 'Slugs', desc: 'Eaten rosettes. Beer traps; organic slug pellets.' }
    ]
  },
  'Roquette': {
    conseils: ['Harvest young for less bitterness', 'Sow every 15 days for a continuous harvest', 'Bolts in heat — prefer spring and autumn sowing'],
    maladies: [
      { icon: '🪲', nom: 'Flea beetles', desc: 'Round holes in leaves. Insect-proof fleece; ash.' }
    ]
  },
  'Navet': {
    conseils: ['Sow in situ — does not tolerate transplanting', 'Thin to 15 cm for storage turnips', 'Harvest young for "primeur" turnips'],
    maladies: [
      { icon: '🪲', nom: 'Flea beetles', desc: 'Holes in leaves. Insect-proof fleece after sowing.' },
      { icon: '🟤', nom: 'Club root', desc: 'Swellings on roots. Limed soil; minimum 5-year rotation.' }
    ]
  },
  'Chou': {
    conseils: ['Plant deep for a sturdy stem', 'Protect with netting against white butterflies', 'Harvest after the first frosts for better flavour'],
    maladies: [
      { icon: '🟤', nom: 'Club root', desc: 'Swellings on roots. Lime soil; long rotation.' },
      { icon: '🦋', nom: 'Cabbage white butterfly', desc: 'Pale green caterpillars devouring leaves. Netting; Bt spray.' },
      { icon: '🪲', nom: 'Flea beetles', desc: 'Many small holes in leaves. Insect-proof fleece.' }
    ]
  },
  'Chou-fleur': {
    conseils: ['Fold leaves over the curd to keep it white', 'Water regularly — water stress causes fluffy, poor curds', 'Harvest when the curd is tightly packed'],
    maladies: [
      { icon: '🦋', nom: 'Cabbage white butterfly', desc: 'Light-green caterpillars. Insect netting; Bt.' },
      { icon: '🟤', nom: 'Club root', desc: 'Root swellings. Lime soil; strict rotation.' }
    ]
  },
  'Brocoli': {
    conseils: ['Cut the main head before flowering to encourage side shoots', 'Very rich in vitamins — eat fresh after harvest', 'Plant mid-season for an autumn harvest'],
    maladies: [
      { icon: '🦋', nom: 'Cabbage white butterfly', desc: 'Caterpillars on leaves. Netting; Bt.' },
      { icon: '🍂', nom: 'Downy mildew', desc: 'White-grey fuzz. Airflow; space plants.' }
    ]
  },
  'Chou rouge': {
    conseils: ['Needs a long growing season — plant early', 'Withstands early frosts well', 'Vinegar fixes its red colour when cooking'],
    maladies: [
      { icon: '🦋', nom: 'Cabbage white butterfly', desc: 'Green caterpillars. Insect netting; Bt.' }
    ]
  },
  'Chou de Bruxelles': {
    conseils: ['Plant in May for a November–February harvest', 'Remove lower leaves as sprouts develop up the stem', 'The first frosts improve the flavour'],
    maladies: [
      { icon: '🦋', nom: 'Cabbage white butterfly', desc: 'Caterpillars devouring leaves and sprouts. Netting; Bt.' },
      { icon: '🟤', nom: 'Club root', desc: 'Deformed roots. Lime; 5-year rotation.' }
    ]
  },
  'Aubergine': {
    conseils: ['Needs heat — do not plant outside before May', 'Stake to prevent loaded branches from snapping', 'Pinch after 4–5 fruits have set to help them swell'],
    maladies: [
      { icon: '🐛', nom: 'Aphids', desc: 'Colonies under leaves. Diluted black soap.' },
      { icon: '🕷️', nom: 'Spider mites', desc: 'Bronzed leaves in hot dry weather. Mist the foliage.' }
    ]
  },
  'Piment': {
    conseils: ['Similar to peppers but even more heat-demanding', 'Can overwinter indoors as a perennial', 'The riper the fruit, the hotter it is'],
    maladies: [
      { icon: '🐛', nom: 'Aphids', desc: 'Colonies under leaves. Black soap.' },
      { icon: '🕷️', nom: 'Spider mites', desc: 'Hot, dry conditions. Mist leaves; use organic insecticide.' }
    ]
  },
  'Pomme de terre': {
    conseils: ['Earth up regularly to prevent greening of tubers', 'Do not replant on the same plot for 3–4 years', 'Chit seed potatoes before planting'],
    maladies: [
      { icon: '🍂', nom: 'Late blight', desc: 'Brown patches on leaves and stems. Apply Bordeaux mixture preventively.' },
      { icon: '🪲', nom: 'Colorado beetle', desc: 'Orange larvae devouring foliage. Hand-pick; Bt; rotate crops.' }
    ]
  },
  'Patate douce': {
    conseils: ['Needs a long, hot summer — ideal in the South', 'Plant slips in May–June', 'Harvest before the first frosts — the leaves turn black'],
    maladies: [
      { icon: '🐛', nom: 'Sweet potato weevil', desc: 'Larvae inside tubers. Rotate crops; monitor plants.' }
    ]
  },
  'Persil': {
    conseils: ['Soak seeds 24 h before sowing to speed germination', 'Cover in winter with fleece to harvest year-round', 'Cut flowering stems to extend production'],
    maladies: [
      { icon: '🪲', nom: 'Parsley fly', desc: 'Tunnels inside leaves. Insect-proof fleece.' },
      { icon: '🍂', nom: 'Septoria leaf spot', desc: 'Yellow spots on leaves. Remove leaves; good airflow.' }
    ]
  },
  'Panais': {
    conseils: ['Sow in situ early in spring — does not tolerate transplanting', 'Deep, stone-free soil like carrots', 'Flavour improves after frosts'],
    maladies: [
      { icon: '🍂', nom: 'Downy mildew', desc: 'Yellow leaves. Rotate crops; good airflow.' },
      { icon: '🪲', nom: 'Carrot fly', desc: 'Also attacks parsnips. Insect-proof fleece.' }
    ]
  },
  'Celeri-rave': {
    conseils: ['Start indoors 3 months before transplanting', 'Keep the crown clear of soil for a clean vegetable', 'Water regularly — does not tolerate drought'],
    maladies: [
      { icon: '🍂', nom: 'Septoria leaf spot', desc: 'Brown spots on leaves. Remove leaves; rotate crops.' },
      { icon: '🪲', nom: 'Celery fly', desc: 'Tunnels inside leaves. Insect-proof fleece.' }
    ]
  },
  'Celeri branche': {
    conseils: ['Blanch by wrapping stems 2 weeks before harvest for a milder flavour', 'Very thirsty — mulch abundantly', 'Can be grown in a container with regular watering'],
    maladies: [
      { icon: '🍂', nom: 'Septoria leaf spot', desc: 'Brown spots on leaves. Rotate crops; remove affected leaves.' }
    ]
  },
  'Fenouil': {
    conseils: ['Isolate, as it inhibits many neighbouring plants', 'Earth up the bulb to blanch it and sweeten the flavour', 'Harvest before the bulb bolts'],
    maladies: [
      { icon: '🐛', nom: 'Fennel aphids', desc: 'White colonies on stems. Diluted black soap.' }
    ]
  },
  'Aneth': {
    conseils: ['Sow direct — dislikes transplanting', 'Leave a few plants to self-seed naturally', 'Harvest young leaves before flowering'],
    maladies: [
      { icon: '🐛', nom: 'Aphids', desc: 'Colonies on flower stems. Black soap.' }
    ]
  },
  'Coriandre': {
    conseils: ['Sow in situ — dislikes transplanting', 'Bolts in heat — prefer spring and autumn', 'Harvest early morning for maximum aroma'],
    maladies: [
      { icon: '🪲', nom: 'Flea beetles', desc: 'Small holes in leaves. Insect-proof fleece.' }
    ]
  },
  'Estragon': {
    conseils: ['Choose French tarragon (more aromatic) over Russian tarragon', 'Propagate easily by division or cuttings', 'Cut stems to prevent bolting'],
    maladies: [
      { icon: '🍂', nom: 'Rust', desc: 'Orange pustules under leaves. Remove leaves; improve drainage.' }
    ]
  },
  'Menthe': {
    conseils: ['Plant in a pot or with a barrier — very invasive', 'Cut back after flowering to stimulate regrowth', 'Can be harvested year-round under cover'],
    maladies: [
      { icon: '🍂', nom: 'Rust', desc: 'Orange pustules on leaves. Cut right back and burn affected stems.' }
    ]
  },
  'Thym': {
    conseils: ['Prune after flowering to prevent it becoming woody', 'Very drought-tolerant — water sparingly', 'A natural repellent against many pests'],
    maladies: [
      { icon: '🍂', nom: 'Grey mould (Botrytis)', desc: 'Grey mould on stems. Prune; good airflow; well-drained soil.' }
    ]
  },
  'Romarin': {
    conseils: ['Plant in well-drained soil — dislikes waterlogging', 'Protect from hard frosts in cold climates', 'Prune lightly after flowering'],
    maladies: [
      { icon: '🍂', nom: 'Root rot', desc: 'Soil too moist. Plant in very free-draining soil; avoid overwatering.' }
    ]
  },
  'Sauge': {
    conseils: ['Excellent repellent against cabbage pests', 'Cut back after flowering; avoid letting it become too woody', 'Propagate by summer cuttings'],
    maladies: [
      { icon: '⬜', nom: 'Powdery mildew', desc: 'White powder on leaves. Diluted baking soda; good airflow.' }
    ]
  },
  'Origan': {
    conseils: ['Very low-maintenance; tolerates drought', 'Dry in bunches in the shade to preserve its aroma', 'Can become invasive — contain with edging'],
    maladies: [
      { icon: '🍂', nom: 'Rust', desc: 'Pustules on leaves. Remove leaves; good airflow.' }
    ]
  },
  'Melon': {
    conseils: ['Pinch the tip of each stem after 2 fruits have set', 'Slip a tile under fruits to prevent rot', 'Harvest when a small crack appears at the base of the stem'],
    maladies: [
      { icon: '⬜', nom: 'Powdery mildew', desc: 'White powder on leaves. Diluted baking soda.' },
      { icon: '🍂', nom: 'Downy mildew', desc: 'Angular yellow patches. Avoid wetting leaves.' }
    ]
  },
  'Potiron': {
    conseils: ['Leave one plant per mound with plenty of compost', 'Remove side shoots after 3–4 fruits have set', 'Let the stem harden before harvest for longer storage'],
    maladies: [
      { icon: '⬜', nom: 'Powdery mildew', desc: 'White coating at the end of season. Harvest before it spreads.' }
    ]
  },
  'Potimarron': {
    conseils: ['Stores very well — up to 6 months in a cool, dry place', 'Edible with the skin — very convenient', 'Vigorous growth — allow plenty of space'],
    maladies: [
      { icon: '⬜', nom: 'Powdery mildew', desc: 'End of season. Harvest before it spreads.' }
    ]
  },
  'Courge butternut': {
    conseils: ['Skin should be caramel-beige and hard at harvest', 'Store in a dry place at 12–15 °C for up to 3 months', 'Plant on a mound with plenty of compost'],
    maladies: [
      { icon: '⬜', nom: 'Powdery mildew', desc: 'White powder. Treat with baking soda; harvest in time.' }
    ]
  },
  'Pasteque': {
    conseils: ['A warm-weather crop — ideal in southern regions', 'Thump the fruit: a dull sound indicates ripeness', 'Limit to 2–3 fruits per plant for a good size'],
    maladies: [
      { icon: '🍂', nom: 'Downy mildew', desc: 'Leaf spots. Good airflow; avoid moisture on leaves.' }
    ]
  },
  'Haricot vert': {
    conseils: ['Harvest very regularly to extend production', 'Do not sow before soil reaches at least 15 °C', 'Water at the base to prevent disease'],
    maladies: [
      { icon: '🦠', nom: 'Anthracnose', desc: 'Black spots on pods. Rotate crops; use clean seed.' },
      { icon: '🐛', nom: 'Bean weevil', desc: 'Insects inside seeds. Store in a cool place.' }
    ]
  },
  'Feve': {
    conseils: ['Plant in autumn for an early spring harvest', 'Pinch out the growing tips once the first pods form', 'Young leaves and flowers are also edible'],
    maladies: [
      { icon: '🪲', nom: 'Black bean aphid', desc: 'Colonies at stem tips. Pinch tips; spray black soap.' },
      { icon: '🍂', nom: 'Grey mould (Botrytis)', desc: 'Grey mould on pods in humid conditions. Space plants.' }
    ]
  },
  'Petit pois': {
    conseils: ['Sow early in spring or autumn — dislikes heat', 'Support with twigs or netting', 'Harvest before the peas harden for best flavour'],
    maladies: [
      { icon: '⬜', nom: 'Powdery mildew', desc: 'White powder on stems and leaves. Baking soda; good airflow.' },
      { icon: '🐛', nom: 'Pea weevil', desc: 'Semicircular notches on leaves. Usually not serious.' }
    ]
  },
  'Pois mange-tout': {
    conseils: ['Eat pod and peas together when the pod is still flat', 'Stake from 15 cm high', 'Sow early in spring or autumn for a June harvest'],
    maladies: [
      { icon: '⬜', nom: 'Powdery mildew', desc: 'White powder on stems. Baking soda; space plants.' }
    ]
  },
  'Mais doux': {
    conseils: ['Plant in a block rather than a row for good pollination', 'Harvest when the silks are brown and the kernels are plump', 'Excellent companion for squash and beans (the "Three Sisters")'],
    maladies: [
      { icon: '🪲', nom: 'European corn borer', desc: 'Tunnels in stems. Bt; destroy stems after harvest.' }
    ]
  },
  'Fraise': {
    conseils: ['Remove runners except for renewing plants', 'Mulch with straw to prevent mud splashing onto fruits', 'Renew plants every 3 years'],
    maladies: [
      { icon: '🍂', nom: 'Grey mould (Botrytis)', desc: 'Grey mould on fruits. Avoid moisture; remove affected fruits.' },
      { icon: '🐛', nom: 'Aphids', desc: 'Curled leaves. Black soap; attract beneficial insects.' },
      { icon: '🐌', nom: 'Slugs', desc: 'Holes in fruits. Traps; ash; copper barrier.' }
    ]
  },
  'Framboise': {
    conseils: ['Cut fruited canes to the ground at the end of the season', 'Tie new canes to a support', 'Mulch heavily to retain moisture'],
    maladies: [
      { icon: '🍂', nom: 'Grey mould (Botrytis)', desc: 'Grey mould on fruits. Good airflow; remove dead canes.' },
      { icon: '🪲', nom: 'Rose chafer', desc: 'Larvae at the base of canes. Hand-pick adults.' }
    ]
  },
  'Artichaut': {
    conseils: ['Cover the crown with thick mulch in winter in cold areas', 'Remove offsets, leaving only 2–3 heads per plant', 'Harvest flower buds before the scales open'],
    maladies: [
      { icon: '🐛', nom: 'Grey aphids', desc: 'Colonies in the heart of the bud. Black soap; treat early.' },
      { icon: '🍂', nom: 'Grey mould (Botrytis)', desc: 'Mould on leaves. Remove leaves; good airflow.' }
    ]
  },
  'Topinambour': {
    conseils: ['Can become invasive — plant with a root barrier', 'Very easy — grows in poor soil and partial shade', 'Leave some tubers in the ground for natural replanting'],
    maladies: []
  },
  'Asperge': {
    conseils: ['Be patient — do not harvest for the first 2 years to let the plant establish', 'Plant crowns in a deep trench (30 cm) with compost', 'Stop harvesting in June to let the fronds regain strength'],
    maladies: [
      { icon: '🦠', nom: 'Asparagus rust', desc: 'Orange spots on fronds. Use resistant varieties; remove affected fronds.' }
    ]
  },
  'Radis noir': {
    conseils: ['Sow from July to September for an autumn harvest', 'Stores for several months in a cellar in sand', 'Grate and salt 30 min before eating to reduce pungency'],
    maladies: [
      { icon: '🪲', nom: 'Flea beetles', desc: 'Small holes in leaves. Insect-proof fleece.' }
    ]
  },
  'Cresson': {
    conseils: ['Needs plenty of water — grow near a water source or water very regularly', 'Can be grown in a container with a saucer always full of water', 'Harvest stems before flowering for the best aroma'],
    maladies: [
      { icon: '🐌', nom: 'Slugs', desc: 'Holes in leaves. Traps; ash.' }
    ]
  },
  'Kale': {
    conseils: ['Harvest leaves from the bottom up, leaving the top growing point', 'Frost-hardy — continues to grow in winter', 'Young leaves are less bitter'],
    maladies: [
      { icon: '🦋', nom: 'Cabbage white butterfly', desc: 'Green caterpillars. Insect netting; Bt.' },
      { icon: '🪲', nom: 'Flea beetles', desc: 'Small holes in leaves. Insect-proof fleece.' }
    ]
  },
  'Pak choi': {
    conseils: ['Quick crop — ready to harvest in 6 weeks', 'Bolts in heat — sow in spring or autumn', 'Can be harvested as baby leaf from 3 weeks'],
    maladies: [
      { icon: '🪲', nom: 'Flea beetles', desc: 'Small holes in leaves. Insect-proof fleece.' }
    ]
  },
  'Chicor\u00e9e': {
    conseils: ['Tolerates heat better than lettuce', 'Bitterness reduces with cooking', 'Can be forced in a cellar to obtain chicons like endive'],
    maladies: [
      { icon: '🐌', nom: 'Slugs', desc: 'Holes in leaves. Traps; ash.' }
    ]
  },
  'Endive': {
    conseils: ['Sow in May–June, lift in autumn, then force in the dark in a cellar', 'Cut leaves to 2 cm above the crown before forcing', 'Forcing takes 3–4 weeks in total darkness'],
    maladies: [
      { icon: '🍂', nom: 'Grey mould (Botrytis)', desc: 'Rot during forcing. Limit humidity.' }
    ]
  },
  'Groseille': {
    conseils: ['Prune right after harvest to encourage fruiting lateral shoots', 'Harvest when fruits are fully coloured', 'Very productive once established'],
    maladies: [
      { icon: '🍂', nom: 'Grey mould (Botrytis)', desc: 'Mould on fruits in wet weather. Remove mummified fruits; prune.' },
      { icon: '⬜', nom: 'Powdery mildew', desc: 'White coating on leaves. Treat with baking soda or sulphur.' }
    ]
  }
};

// Palette de couleurs premium par famille botanique
var FAMILY_COLORS = {
  'Solanacees':     ['#c2410c','#7c2d12'],
  'Cucurbitacees':  ['#65a30d','#3f6212'],
  'Asteracees':     ['#7c3aed','#4c1d95'],
  'Brassicacees':   ['#0d9488','#134e4a'],
  'Apiacees':       ['#d97706','#78350f'],
  'Liliacees':      ['#7c3aed','#3b0764'],
  'Fabacees':       ['#16a34a','#14532d'],
  'Chenopodiacees': ['#059669','#064e3b'],
  'Lamiacees':      ['#4d7c0f','#1a2e05'],
  'Rosacees':       ['#e11d48','#881337'],
  'Poacees':        ['#ca8a04','#713f12'],
  'Valerianacees':  ['#0891b2','#164e63'],
  'Convolvulacees': ['#ea580c','#7c2d12'],
  'Asparagacees':   ['#10b981','#064e3b'],
  'Grossulariacees':['#dc2626','#7f1d1d']
};
function _ficheGradient(family) {
  var c = FAMILY_COLORS[family] || ['#0b5d47','#064e3b'];
  return 'linear-gradient(140deg,' + c[0] + ' 0%,' + c[1] + ' 100%)';
}
function _ficheLeafSVG() {
  return '<svg class="fiche-hero-leaf-svg" viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path d="M260,8 C300,48 312,90 260,115 C208,90 220,48 260,8Z" fill="rgba(255,255,255,0.09)"/>' +
    '<path d="M55,25 C95,65 107,107 55,132 C3,107 15,65 55,25Z" fill="rgba(255,255,255,0.07)"/>' +
    '<circle cx="170" cy="18" r="14" fill="rgba(255,255,255,0.06)"/>' +
    '<circle cx="140" cy="110" r="9" fill="rgba(255,255,255,0.07)"/>' +
    '<circle cx="290" cy="50" r="5" fill="rgba(255,255,255,0.08)"/>' +
  '</svg>';
}

function ouvrirFicheVeggie(veggieId) {
  var veg = APP.vegetables[veggieId];
  if (!veg) return;

  var enrichi = null;
  var vegNomNorm = normalizeVeggieName(veg.name);
  var enrichiKeys = Object.keys(VEGGIE_ENRICHI);
  for (var i = 0; i < enrichiKeys.length; i++) {
    if (normalizeVeggieName(enrichiKeys[i]) === vegNomNorm) {
      enrichi = VEGGIE_ENRICHI[enrichiKeys[i]];
      break;
    }
  }
  // Use English content when language is EN
  var _ficheEnrichiLang = (getAppState('language') || 'fr') === 'en' ? VEGGIE_ENRICHI_EN : null;
  if (_ficheEnrichiLang && enrichi) {
    var _enKeys = Object.keys(_ficheEnrichiLang);
    for (var _ei = 0; _ei < _enKeys.length; _ei++) {
      if (normalizeVeggieName(_enKeys[_ei]) === vegNomNorm) {
        var _enData = _ficheEnrichiLang[_enKeys[_ei]];
        enrichi = { conseils: _enData.conseils, maladies: _enData.maladies, associations: enrichi.associations };
        break;
      }
    }
  }

  var cal = (typeof GeoCalendar !== 'undefined')
    ? GeoCalendar.getCalendarForVeggie(veg)
    : getPlantingCalendarForVeggie(veg);
  var moisLettre = ['J','F','M','A','M','J','J','A','S','O','N','D'];

  // ---- Hero premium ----
  var diffLabel = veg.difficulty === 1 ? t('cal_diff_easy') : veg.difficulty === 2 ? t('cal_diff_medium') : veg.difficulty === 3 ? t('cal_diff_hard') : '';
  var waterLabel = veg.water >= 7 ? t('cal_water_high') : veg.water >= 4 ? t('cal_water_med') : t('cal_water_low');
  var sunLabel   = veg.sun >= 8 ? t('cal_sun_full') : veg.sun >= 5 ? t('cal_sun_half') : t('cal_sun_shade');
  var heroHTML =
    '<div class="fiche-hero-v2" style="background:' + _ficheGradient(veg.family) + '">' +
      _ficheLeafSVG() +
      '<div class="fiche-hero-v2-close">' +
        '<button class="modal-close fiche-hero-close-btn" onclick="closeModal()">\u00D7</button>' +
      '</div>' +
      '<div class="fiche-hero-v2-main">' +
        '<div class="fiche-hero-v2-emo">' + vIcon(veg, veggieId, 64) + '</div>' +
        '<div class="fiche-hero-v2-text">' +
          '<div class="fiche-hero-v2-nom">' + escH(tVeg(veg.name)) + '</div>' +
          '<div class="fiche-hero-v2-fam">' + escH(t('family_' + veg.family)) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="fiche-hero-v2-chips">' +
        (diffLabel ? '<span class="fiche-chip">\u2B50 ' + diffLabel + '</span>' : '') +
        (veg.water ? '<span class="fiche-chip">\uD83D\uDCA7 ' + waterLabel + '</span>' : '') +
        (veg.sun   ? '<span class="fiche-chip">\u2600\uFE0F ' + sunLabel + '</span>' : '') +
        '<span class="fiche-chip">\u23F1 ' + veg.daysToHarvest + t('lbl_days_abbr') + '</span>' +
      '</div>' +
    '</div>';

  // ---- Stats premium ----
  var statsHTML =
    '<div class="fiche-kpi-row">' +
      '<div class="fiche-kpi"><div class="fiche-kpi-ico">\uD83D\uDCC8</div><div class="fiche-kpi-val">' + veg.yieldPerM2 + ' kg</div><div class="fiche-kpi-lbl">' + t('cal_per_m2') + '</div></div>' +
      '<div class="fiche-kpi"><div class="fiche-kpi-ico">\u23F1</div><div class="fiche-kpi-val">' + veg.daysToHarvest + t('lbl_days_abbr') + '</div><div class="fiche-kpi-lbl">' + t('cal_to_harvest') + '</div></div>' +
      '<div class="fiche-kpi"><div class="fiche-kpi-ico">\uD83D\uDCCF</div><div class="fiche-kpi-val">' + veg.spacePerPlant + ' m\u00B2</div><div class="fiche-kpi-lbl">' + t('cal_per_plant') + '</div></div>' +
    '</div>';

  // ---- Calendrier 12 cases ----
  var calHTML = '<div class="fiche-cal-strip">';
  var hasIndoor = cal && cal.indoorMonths && cal.indoorMonths.length > 0;
  var hasBoth   = false;
  for (var m = 1; m <= 12; m++) {
    var isPlant   = cal && cal.plantMonths   && cal.plantMonths.indexOf(m)   >= 0;
    var isHarvest = cal && cal.harvestMonths && cal.harvestMonths.indexOf(m) >= 0;
    var isIndoor  = cal && cal.indoorMonths  && cal.indoorMonths.indexOf(m)  >= 0;
    var cls = isPlant && isHarvest ? 'both'
            : isIndoor  ? 'indoor'
            : isPlant   ? 'plant'
            : isHarvest ? 'harvest'
            : 'none';
    if (cls === 'both') hasBoth = true;
    calHTML += '<div class="fiche-cal-case ' + cls + '">' + moisLettre[m-1] + '</div>';
  }
  calHTML += '</div>';
  calHTML += '<div class="fiche-cal-legende">';
  if (hasIndoor) {
    calHTML += '<div class="fiche-cal-legende-item"><div class="fiche-cal-legende-dot" style="background:#7c3aed"></div>' + t('cal_legend_indoor') + '</div>';
  }
  calHTML += '<div class="fiche-cal-legende-item"><div class="fiche-cal-legende-dot" style="background:var(--green-500)"></div>' + t('cal_legend_planting') + '</div>';
  if (hasBoth) {
    calHTML += '<div class="fiche-cal-legende-item"><div class="fiche-cal-legende-dot" style="background:var(--brand-900)"></div>' + t('cal_legend_both') + '</div>';
  }
  calHTML += '<div class="fiche-cal-legende-item"><div class="fiche-cal-legende-dot" style="background:var(--orange)"></div>' + t('cal_legend_harvest') + '</div>';
  calHTML += '</div>';

  // ---- Bloc GDD adaptatif (V3.2) ----
  var _isEn  = (getAppState('language') || 'fr') === 'en';
  var gddHtml = '';
  if (typeof GeoCalendar !== 'undefined' && typeof ClimateModule !== 'undefined') {
    var _climate = ClimateModule.get();
    if (_climate) {
      var _pheno = GeoCalendar.getPhenology(veg);
      if (_pheno) {
        var _suf    = GeoCalendar.isSeasonSufficient(veg, _climate);
        var _koppen = _climate.koppen || '';
        var _icon, _color, _msg;
        var _pct = Math.round(_suf.ratio * 100);
        if (!_suf.ok) {
          _icon = '⚠️'; _color = '#b05000';
          _msg  = _isEn
            ? 'Your season covers only ' + _pct + '% of this crop\'s heat needs. Choose an early-season variety.'
            : 'Votre saison couvre seulement ' + _pct + '% des besoins en chaleur de cette culture. Préférez une variété hâtive.';
        } else if (_suf.ratio < 1.3) {
          _icon = '⏱️'; _color = '#7a5a00';
          _msg  = _isEn
            ? 'Season just long enough (' + _pct + '% of heat needs met). Plant as early as possible.'
            : 'Saison tout juste suffisante (' + _pct + '% des besoins en chaleur). Plantez dès que possible.';
        } else {
          _icon = '✅'; _color = '#2d7a3a';
          _msg  = _isEn
            ? 'Your season is well suited to this crop (' + _pct + '% of heat needs met).'
            : 'Votre saison convient bien à cette culture (' + _pct + '% des besoins en chaleur couverts).';
        }
        var _koppenLabel = (typeof ClimateModule !== 'undefined' && _koppen)
          ? ClimateModule.koppenLabel(_koppen) : '';
        var _note = (cal && cal.adjusted)
          ? '<div style="margin-top:3px;font-size:0.75rem;color:#666;">📍 ' +
            (_isEn
              ? 'Calendar adapted to your location' + (_koppenLabel ? ' (' + _koppenLabel + ')' : '') + '.'
              : 'Calendrier adapté à votre localisation' + (_koppenLabel ? ' (' + _koppenLabel + ')' : '') + '.') +
            '</div>'
          : '';
        gddHtml = '<div style="margin-top:10px;padding:9px 12px;background:#f4fbf4;border-left:3px solid ' + _color + ';border-radius:6px;font-size:0.82rem;">' +
          '<span style="color:' + _color + ';font-weight:600;">' + _icon + ' ' + _msg + '</span>' + _note + '</div>';
      }
    } else {
      gddHtml = '<div style="margin-top:10px;padding:8px 10px;background:#f5f5f5;border-radius:6px;font-size:0.78rem;color:#888;">📍 ' +
        (_isEn ? 'Add your location in Settings for a climate-adapted calendar.' : 'Ajoutez votre localisation dans Paramètres pour un calendrier adapté.') + '</div>';
    }
  }

  // ---- Sensibilites ----
  var sensib = veg.sensitivity || {};
  var sensibItems = [
    { icon: '\u2600\uFE0F', lbl: t('cal_sensib_heat'), val: sensib.hot || 5, color: '#f97316' },
    { icon: '\uD83C\uDF27\uFE0F', lbl: t('cal_sensib_rain'), val: sensib.rain || 5, color: '#457b9d' },
    { icon: '\u2744\uFE0F', lbl: t('cal_sensib_cold'),  val: sensib.cold || 5, color: '#60a5fa' },
    { icon: '\uD83D\uDCA8', lbl: t('cal_sensib_wind'),   val: sensib.wind || 5, color: '#94a3b8' }
  ];
  var sensibHTML = '<div class="fiche-section"><div class="fiche-section-titre">' + t('cal_section_sensib') + '</div>';
  for (var si = 0; si < sensibItems.length; si++) {
    var s = sensibItems[si];
    var largeur = (s.val / 10 * 100).toFixed(0);
    sensibHTML +=
      '<div class="fiche-sensib-row">' +
        '<div class="fiche-sensib-lbl">' + s.icon + ' ' + s.lbl + '</div>' +
        '<div class="fiche-sensib-track"><div class="fiche-sensib-fill" style="width:' + largeur + '%;background:' + s.color + '"></div></div>' +
        '<div class="fiche-sensib-val">' + s.val + '/10</div>' +
      '</div>';
  }
  sensibHTML += '</div>';

  // ---- Associations ----
  var assocHTML = '';
  if (enrichi && enrichi.associations) {
    var bons = enrichi.associations.bons || [];
    var mauvais = enrichi.associations.mauvais || [];
    assocHTML = '<div class="fiche-section"><div class="fiche-section-titre">' + t('cal_section_assoc') + '</div>';
    if (bons.length > 0) {
      assocHTML += '<div class="fiche-assoc-label fiche-assoc-bon">' + t('cal_assoc_good') + '</div><div class="fiche-assoc-grid">';
      for (var bi = 0; bi < bons.length; bi++) {
        assocHTML += '<span class="fiche-tag fiche-tag-bon">' + escH(tVeg(bons[bi])) + '</span>';
      }
      assocHTML += '</div>';
    }
    if (mauvais.length > 0) {
      assocHTML += '<div class="fiche-assoc-label fiche-assoc-bad">' + t('cal_assoc_bad') + '</div><div class="fiche-assoc-grid">';
      for (var mi = 0; mi < mauvais.length; mi++) {
        assocHTML += '<span class="fiche-tag fiche-tag-mauvais">' + escH(tVeg(mauvais[mi])) + '</span>';
      }
      assocHTML += '</div>';
    }
    assocHTML += '</div>';
  }

  // ---- Maladies ----
  var maladiesHTML = '';
  if (enrichi && enrichi.maladies && enrichi.maladies.length > 0) {
    maladiesHTML = '<div class="fiche-section"><div class="fiche-section-titre">' + t('cal_section_diseases') + '</div>';
    for (var di = 0; di < enrichi.maladies.length; di++) {
      var mal = enrichi.maladies[di];
      maladiesHTML +=
        '<div class="fiche-maladie">' +
          '<div class="fiche-maladie-icon">' + mal.icon + '</div>' +
          '<div>' +
            '<div class="fiche-maladie-nom">' + escH(mal.nom) + '</div>' +
            '<div class="fiche-maladie-desc">' + escH(mal.desc) + '</div>' +
          '</div>' +
        '</div>';
    }
    maladiesHTML += '</div>';
  }

  // ---- Conseils ----
  var conseilsHTML = '';
  if (enrichi && enrichi.conseils && enrichi.conseils.length > 0) {
    conseilsHTML = '<div class="fiche-section"><div class="fiche-section-titre">' + t('cal_section_tips') + '</div>';
    for (var ci = 0; ci < enrichi.conseils.length; ci++) {
      conseilsHTML +=
        '<div class="fiche-conseil-v2">' +
          '<div class="fiche-conseil-num">' + (ci + 1) + '</div>' +
          '<div class="fiche-conseil-text">' + escH(enrichi.conseils[ci]) + '</div>' +
        '</div>';
    }
    conseilsHTML += '</div>';
  }

  var pasEnrichiHTML = '';
  if (!enrichi) {
    pasEnrichiHTML = '<div class="fiche-section"><div class="fiche-no-data">' + t('cal_data_soon') + '</div></div>';
  }

  var _ficheIsFav = isVeggieFavorite(veggieId);
  openModal(
    heroHTML +
    statsHTML +
    '<div class="fiche-section"><div class="fiche-section-titre">' + t('cal_section_calendar') + '</div>' + calHTML + gddHtml + '</div>' +
    sensibHTML +
    assocHTML +
    maladiesHTML +
    conseilsHTML +
    pasEnrichiHTML +
    '<div class="fiche-actions-row">' +
      '<button class="btn btn-primary btn-sm" style="flex:1;" onclick="closeModal();setTimeout(function(){openCropModal(null,null,\'' + veggieId + '\');},50)">' + t('ref_add_to_garden') + '</button>' +
      '<button id="fav-fiche-btn-' + veggieId + '" class="btn btn-secondary btn-sm" onclick="toggleVeggieFavorite(\'' + veggieId + '\')" title="' + t('settings_filter_fav') + '" style="font-size:1.1rem;padding:4px 10px;">' + (_ficheIsFav ? '\u2B50' : '\u2606') + '</button>' +
      '<button class="btn btn-secondary btn-sm" onclick="openVeggieModal(\'' + veggieId + '\');closeModal()">' + t('cal_fiche_edit') + '</button>' +
      '<button class="btn btn-danger btn-sm" onclick="deleteVeggie(\'' + veggieId + '\');closeModal()">' + t('cal_fiche_delete') + '</button>' +
    '</div>'
  );
}

// ============================================================


// --- Fonctions calendrier (déplacées depuis settings.js) ---
// ========== CALENDRIER ==========




function renderCalendar() {
  var el = document.getElementById('pageCalendar');
  el.innerHTML = (function() {
    var cells = '';
    for (var _i = 0; _i < 35; _i++) {
      cells += '<div class="skel skel-cal-day"></div>';
    }
    return '<div class="skel-page" style="padding:0;">' +
      // Legend row
      '<div style="display:flex;gap:10px;margin-bottom:14px;align-items:center;">' +
        '<div class="skel" style="width:72px;height:10px;border-radius:5px;"></div>' +
        '<div class="skel" style="width:72px;height:10px;border-radius:5px;"></div>' +
        '<div class="skel" style="width:72px;height:10px;border-radius:5px;"></div>' +
        '<div class="skel" style="width:60px;height:10px;border-radius:5px;"></div>' +
      '</div>' +
      // Month nav
      '<div class="skel-card" style="height:46px;border-radius:16px;margin-bottom:12px;"></div>' +
      // Day headers
      '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:5px;margin-bottom:5px;">' +
        '<div class="skel" style="height:9px;border-radius:4px;"></div>' +
        '<div class="skel" style="height:9px;border-radius:4px;"></div>' +
        '<div class="skel" style="height:9px;border-radius:4px;"></div>' +
        '<div class="skel" style="height:9px;border-radius:4px;"></div>' +
        '<div class="skel" style="height:9px;border-radius:4px;"></div>' +
        '<div class="skel" style="height:9px;border-radius:4px;"></div>' +
        '<div class="skel" style="height:9px;border-radius:4px;"></div>' +
      '</div>' +
      // Calendar grid 5 rows
      '<div class="skel-cal-grid">' + cells + '</div>' +
    '</div>';
  }());
  fetchWeather().then(function(weather) {
    calMoisAffiche = calMoisAffiche !== undefined ? calMoisAffiche : new Date().getMonth();
    calAnneeAffichee = calAnneeAffichee !== undefined ? calAnneeAffichee : new Date().getFullYear();
    el.innerHTML = '<div class="fade-in">' + buildCalendar(weather) + '</div>';
  });
}



function buildCalendar(weather) {
  var _calLocale = (getAppState('language') || 'fr') === 'en' ? 'en-US' : 'fr-FR';
  var moisNoms = [];
  for (var _cmi = 0; _cmi < 12; _cmi++) {
    var _mn = new Date(2000, _cmi, 1).toLocaleString(_calLocale, { month: 'long' });
    moisNoms.push(_mn.charAt(0).toUpperCase() + _mn.slice(1));
  }
  // joursNoms: lundi=0...dimanche=6 (2000-01-03 = lundi)
  var joursNoms = [];
  for (var _cji = 0; _cji < 7; _cji++) {
    joursNoms.push(new Date(2000, 0, 3 + _cji).toLocaleString(_calLocale, { weekday: 'narrow' }));
  }
  var today = new Date();
  var todayY = today.getFullYear();
  var todayM = today.getMonth();
  var todayD = today.getDate();

  var mois = calMoisAffiche;
  var annee = calAnneeAffichee;

  // Premier jour du mois et nombre de jours
  var premierJour = new Date(annee, mois, 1).getDay(); // 0=dim
  premierJour = premierJour === 0 ? 6 : premierJour - 1; // lundi=0
  var nbJours = new Date(annee, mois + 1, 0).getDate();

  // Construire les evenements de ce mois
  var evtParJour = buildEventsParJour(annee, mois, weather);

  // Légende premium
  var html = '<div class="prem-cal-legend">' +
    '<div class="prem-cal-legend-item"><div class="prem-cal-dot" style="background:#52b788"></div>' + t('cal_legend_planting') + '</div>' +
    '<div class="prem-cal-legend-item"><div class="prem-cal-dot" style="background:#e76f51"></div>' + t('cal_legend_harvest') + '</div>' +
    '<div class="prem-cal-legend-item"><div class="prem-cal-dot" style="background:#457b9d"></div>' + t('cal_legend_task') + '</div>' +
    '<div class="prem-cal-legend-item"><div class="prem-cal-dot" style="background:#e63946"></div>' + t('cal_legend_urgent') + '</div>' +
  '</div>';

  // Navigation mois premium
  html += '<div class="prem-cal-nav">' +
    '<button class="prem-cal-nav-btn" onclick="calNaviguer(-1)">&#8249;</button>' +
    '<div class="prem-cal-nav-title">' + moisNoms[mois] + ' ' + annee + '</div>' +
    '<button class="prem-cal-nav-btn" onclick="calNaviguer(1)">&#8250;</button>' +
  '</div>';

  // Header jours premium
  html += '<div class="prem-cal-days-header">';
  for (var j = 0; j < 7; j++) {
    html += '<div>' + joursNoms[j] + '</div>';
  }
  html += '</div>';

  // Grille premium
  html += '<div class="prem-cal-grid" id="calGrille">';

  // Cases vides avant le 1er
  for (var v = 0; v < premierJour; v++) {
    html += '<div class="prem-cal-day empty"></div>';
  }

  for (var d = 1; d <= nbJours; d++) {
    var isToday = (d === todayD && mois === todayM && annee === todayY);
    var isSelected = (d === calJourSelectionne);
    var evts = evtParJour[d] || [];
    var hasEvent = evts.length > 0;

    var classes = 'prem-cal-day';
    if (isToday) classes += ' today';
    else if (hasEvent) classes += ' has-event';

    // Points de couleur (max 3)
    var dotsHTML = '';
    if (evts.length > 0 && !isToday) {
      dotsHTML = '<div class="prem-cal-day-dots">';
      var shown = Math.min(evts.length, 3);
      for (var ei = 0; ei < shown; ei++) {
        dotsHTML += '<div class="prem-cal-day-dot" style="background:' + evts[ei].couleur + '"></div>';
      }
      dotsHTML += '</div>';
    }

    html += '<div class="' + classes + '" onclick="calSelectionnerJour(' + d + ')">' +
      '<div class="prem-cal-day-num">' + d + '</div>' +
      dotsHTML +
    '</div>';
  }

  html += '</div>';

  // Detail du jour sélectionné premium
  html += '<div class="prem-cal-detail" id="calDetail">' +
    buildDetailJour(annee, mois, calJourSelectionne, evtParJour, moisNoms, todayD, todayM, todayY) +
  '</div>';

  return html;
}



function buildEventsParJour(annee, mois, weather) {
  var evtParJour = {};

  function addEvt(jour, evt) {
    if (!evtParJour[jour]) evtParJour[jour] = [];
    evtParJour[jour].push(evt);
  }

  // Cultures avec dates dans ce mois
  var cultures = APP.crops.filter(function(c) { return c.season === APP.currentSeason; });
  for (var ci = 0; ci < cultures.length; ci++) {
    var crop = cultures[ci];
    var veg = APP.vegetables[crop.veggieId];
    if (!veg) continue;

    // Date de plantation
    if (crop.datePlant) {
      var dp = new Date(crop.datePlant);
      if (dp.getFullYear() === annee && dp.getMonth() === mois) {
        addEvt(dp.getDate(), {
          type: 'plantation',
          couleur: '#52b788',
          icon: veg.icon,
          titre: t('cal_evt_plant').replace('{name}', tVeg(veg.name)),
          sous: crop.status === 'planned' ? t('stage_planned') : t('cal_plant_sub'),
          priorite: 2
        });
      }
    }

    // Date de recolte prevue
    if (crop.dateHarvest && crop.status !== 'harvested') {
      var dh = new Date(crop.dateHarvest);
      if (dh.getFullYear() === annee && dh.getMonth() === mois) {
        addEvt(dh.getDate(), {
          type: 'recolte',
          couleur: '#e76f51',
          icon: veg.icon,
          titre: t('cal_evt_harvest').replace('{name}', tVeg(veg.name)),
          sous: t('cal_harvest_planned'),
          priorite: 1
        });
      }
    }
  }

  // Taches du jour actuel seulement (si mois actuel)
  var today = new Date();
  if (annee === today.getFullYear() && mois === today.getMonth()) {
    var taches = generateTasks(weather);
    for (var ti = 0; ti < taches.length; ti++) {
      var tache = taches[ti];
      var couleurT = tache.priority === 'urgent' ? '#e63946' : '#457b9d';
      addEvt(today.getDate(), {
        type: 'tache',
        couleur: couleurT,
        icon: tache.priority === 'urgent' ? '🚨' : '📋',
        titre: tache.text,
        sous: tache.category,
        priorite: tache.priority === 'urgent' ? 0 : 1
      });
    }
  }

  // Trier chaque jour par priorite
  var jours = Object.keys(evtParJour);
  for (var ji = 0; ji < jours.length; ji++) {
    evtParJour[jours[ji]].sort(function(a, b) { return (a.priorite || 9) - (b.priorite || 9); });
  }

  return evtParJour;
}



function buildDetailJour(annee, mois, jour, evtParJour, moisNoms, todayD, todayM, todayY) {
  var isToday = (jour === todayD && mois === todayM && annee === todayY);
  var dateObj = new Date(annee, mois, jour);
  var nomJour = t('day_' + dateObj.getDay());
  var dateLabel = nomJour + ' ' + jour + ' ' + moisNoms[mois];
  if (isToday) dateLabel += t('cal_today_suffix');

  var evts = evtParJour[jour] || [];

  var html = '<div class="prem-cal-detail-header">' +
    '<div class="prem-cal-detail-date">' + dateLabel + '</div>' +
  '</div>';

  if (evts.length === 0) {
    html += '<div class="prem-cal-detail-empty">' + t('cal_no_event') + '</div>';
    return html;
  }

  for (var ei = 0; ei < evts.length; ei++) {
    var evt = evts[ei];
    html += '<div class="prem-cal-event">' +
      '<div class="prem-cal-event-bar" style="background:' + evt.couleur + '"></div>' +
      '<div class="prem-cal-event-icon">' + evt.icon + '</div>' +
      '<div style="flex:1;min-width:0;">' +
        '<div class="prem-cal-event-title">' + escH(evt.titre) + '</div>' +
        '<div class="prem-cal-event-sub">' + escH(evt.sous) + '</div>' +
      '</div>' +
    '</div>';
  }

  return html;
}



function calNaviguer(direction) {
  calMoisAffiche += direction;
  if (calMoisAffiche > 11) { calMoisAffiche = 0; calAnneeAffichee++; }
  if (calMoisAffiche < 0)  { calMoisAffiche = 11; calAnneeAffichee--; }
  calJourSelectionne = 1;
  renderCalendar();
}



function calSelectionnerJour(jour) {
  calJourSelectionne = jour;
  // Mettre a jour juste le detail sans tout rerendre
  fetchWeather().then(function(weather) {
    var _selLocale = (getAppState('language') || 'fr') === 'en' ? 'en-US' : 'fr-FR';
    var moisNoms = [];
    for (var _smi = 0; _smi < 12; _smi++) {
      var _smn = new Date(2000, _smi, 1).toLocaleString(_selLocale, { month: 'long' });
      moisNoms.push(_smn.charAt(0).toUpperCase() + _smn.slice(1));
    }
    var today = new Date();
    var evtParJour = buildEventsParJour(calAnneeAffichee, calMoisAffiche, weather);
    var detailEl = document.getElementById('calDetail');
    if (detailEl) {
      detailEl.innerHTML = buildDetailJour(calAnneeAffichee, calMoisAffiche, jour, evtParJour, moisNoms, today.getDate(), today.getMonth(), today.getFullYear());
    }
  });
}
