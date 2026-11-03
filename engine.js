/* GC teaching simulator: numerical model adapted from the MATLAB app. */
(function (root) {
  'use strict';
  // [Spanish name, English name, molecular mass, boiling point, concentration,
  // carbon response, Antoine A/B/C, non-polar phase, polar phase, N, P]
  const groups = {
    FAMES: [
      ['Linolenato (C18:3)','Linolenate (C18:3)',292.5,345,100,18.2,7.400,2450,135,1.05,4.20,0,0],
      ['Linoleato (C18:2)','Linoleate (C18:2)',294.5,347,100,18.2,7.420,2480,132,1.15,2.50,0,0],
      ['Oleato (C18:1)','Oleate (C18:1)',296.5,349,100,18.2,7.440,2510,130,1.25,1.60,0,0],
      ['Estearato (C18:0)','Stearate (C18:0)',298.5,351,100,18.2,7.450,2550,130,1.35,1.05,0,0],
      ['EPA (C20:5)','EPA (C20:5)',316.5,370,100,20.2,7.500,2650,120,1.20,2.30,0,0],
      ['Araquidonato (C20:4)','Arachidonate (C20:4)',318.5,372,100,20.2,7.520,2680,120,1.30,1.90,0,0],
      ['Octanoato (C8)','Octanoate (C8)',158.2,192,100,8.2,7.100,1650,190,.70,.95,0,0],
      ['Decanoato (C10)','Decanoate (C10)',186.3,224,100,10.2,7.150,1820,175,.78,1.05,0,0],
      ['Laurato (C12)','Laurate (C12)',214.3,262,100,12.2,7.200,1950,160,.85,1.15,0,0],
      ['Palmitato (C16:0)','Palmitate (C16:0)',270.4,338,100,16.2,7.350,2350,140,1.05,1.30,0,0]
    ],
    BTEX: [
      ['Benceno','Benzene',78.1,80.1,100,6,6.905,1211,220,.75,.85,0,0],
      ['Tolueno','Toluene',92.1,110.6,100,7,6.953,1343,219,.88,.98,0,0],
      ['Etilbenceno','Ethylbenzene',106.2,136.2,100,8,6.957,1424,213,1.05,1.12,0,0],
      ['p-Xileno','p-Xylene',106.2,138.4,100,8,6.990,1453,215,1.12,1.20,0,0],
      ['o-Xileno','o-Xylene',106.2,144.4,100,8,6.998,1474,213,1.25,1.35,0,0],
      ['Propilbenceno','Propylbenzene',120.2,159.2,100,9,6.931,1491,204,1.45,1.55,0,0]
    ],
    Alcoholes: [
      ['Metanol','Methanol',32,64.7,100,.4,7.878,1473,230,.30,1.20,0,0],['Etanol','Ethanol',46.1,78.4,100,1.4,8.044,1554,222,.35,1.10,0,0],
      ['2-Propanol','2-Propanol',60.1,82.6,100,2.4,7.740,1366,198,.38,1.05,0,0],['1-Propanol','1-Propanol',60.1,97.2,100,2.4,7.847,1499,204,.40,1.15,0,0],
      ['Butanol','Butanol',74.1,117.7,100,3.4,7.476,1362,178,.45,1.25,0,0],['Etilenglicol','Ethyleneglycol',62.1,197.3,100,.8,8.090,2262,214,.50,1.25,0,0]
    ],
    Pesticidas: [
      ['Heptaclor','Heptachlor',373.3,135,100,9.3,7.400,1850,180,.90,1.10,0,0],['Aldrin','Aldrin',364.9,145,100,11.4,7.450,1950,175,1,1.25,0,0],
      ['Dieldrin','Dieldrin',380.9,175,100,11.4,7.550,2100,165,1.15,1.45,0,0],['Lindano','Lindane',290.8,288,100,5.4,7.650,2400,150,1.30,1.60,0,0],
      ['DDT','DDT',354.5,260,100,13.5,7.850,2650,135,1.50,1.85,0,0],['Malation','Malathion',330.3,156,100,6.5,7.950,2300,140,1.20,2.10,0,1],
      ['Clorpirifos','Chlorpyrifos',350.6,160,100,8.2,7.900,2400,160,1.40,1.70,1,1],['Atrazina','Atrazine',215.7,200,100,4.5,8.100,2550,145,1.10,2.05,5,0],
      ['Endosulfán','Endosulfan',406.9,106,100,10.1,7.700,2200,170,1.45,1.55,0,0],['Trifluralina','Trifluralin',335.3,139,100,7.8,7.600,2150,175,1.05,1.30,3,0]
    ],
    Alcanos: [
      ['n-Pentano (C5)','n-Pentane (C5)',72.1,36.1,100,5,6.852,1064,232,.5,.4,0,0],['n-Hexano (C6)','n-Hexane (C6)',86.2,68.7,100,6,6.877,1171,224,.5,.4,0,0],
      ['n-Heptano (C7)','n-Heptane (C7)',100.2,98.4,100,7,6.902,1268,216,.5,.4,0,0],['n-Octano (C8)','n-Octane (C8)',114.2,125.7,100,8,6.923,1355,209,.5,.4,0,0],
      ['n-Decano (C10)','n-Decane (C10)',142.3,174.1,100,10,6.957,1501,194,.5,.4,0,0],['n-Dodecano (C12)','Dodecane (C12)',170.3,216.3,100,12,6.980,1625,180,.5,.4,0,0],
      ['n-Hexadecano (C16)','n-Hexadecane (C16)',226.4,286.8,100,16,7.030,1850,155,.5,.4,0,0],['n-Eicosano (C20)','n-Eicosane (C20)',282.5,343,100,20,7.080,2050,130,.5,.4,0,0],
      ['n-Tetracosano (C24)','n-Tetracosane (C24)',338.7,391.3,100,24,7.120,2230,110,.5,.4,0,0],['n-Triacontano (C30)','n-Triacontane (C30)',422.8,449.7,100,30,7.200,2500,85,.5,.4,0,0]
    ]
  };
  // Correct ethylene glycol's polar factor to the MATLAB source value.
  groups.Alcoholes[5][10] = 2.5;
  const solvents = {
    Hexano:['Hexano','Hexane',86.2,68.7,10000,6,6.877,1171,224,.50,.40,0,0],
    Metanol:['Metanol','Methanol',32,64.7,10000,.4,7.878,1473,230,.35,1.25,0,0],
    Acetona:['Acetona','Acetone',58.1,56.1,10000,2,7.024,1161,224,.45,1.05,0,0],
    Isooctano:['Isooctano','Isooctane',114.2,99.2,10000,8,6.912,1259,220,.55,.45,0,0],
    Tolueno:['Tolueno','Toluene',92.1,110.6,10000,7,6.953,1343,219,.50,.60,0,0],
    Diclorometano:['Diclorometano','Dichloromethane',84.9,39.6,10000,.9,7.080,1138,231,.40,.70,0,0]
  };
  const oils = [
    {id:'OLIVE',es:'Oliva',va:'Oliva',en:'Olive',profile:[13.75,2.75,70,13.75,.75]},
    {id:'SUNFLOWER',es:'Girasol',va:'Gira-sol',en:'Sunflower',profile:[5.5,4,25,64,.3]},
    {id:'SUNFLOWER_HO',es:'Girasol alto oleico',va:'Gira-sol alt oleic',en:'High-oleic sunflower',profile:[4,6,85,5,0]},
    {id:'SOYBEAN',es:'Soja',va:'Soja',en:'Soybean',profile:[10,4,23,54,7.5]},
    {id:'RAPESEED_LE',es:'Colza bajo erúcico',va:'Colza baix en erúcic',en:'Low-erucic rapeseed',profile:[4,1.5,60,20,11]},
    {id:'MAIZE',es:'Maíz',va:'Dacsa',en:'Maize',profile:[11,2,29,56,1]},
    {id:'PALM',es:'Palma',va:'Palma',en:'Palm',profile:[44,4,40,10,.2]},
    {id:'FLAXSEED',es:'Linaza',va:'Llinosa',en:'Flaxseed',profile:[5.5,3.5,17,15,60]}
  ];
  const unknowns = {
    U01:[['OLIVE',1]], U02:[['SUNFLOWER',1]], U03:[['FLAXSEED',1]],
    U04:[['OLIVE',.8],['SOYBEAN',.2]], U05:[['SUNFLOWER_HO',.7],['MAIZE',.3]],
    U06:[['SOYBEAN',.6],['RAPESEED_LE',.4]], U07:[['PALM',.65],['MAIZE',.35]],
    U08:[['OLIVE',.92],['SUNFLOWER_HO',.08]]
  };
  const markers = ['C16:0','C18:0','C18:1','C18:2','C18:3'];
  const markerRows = [9,3,2,1,0];
  const normalise = a => { const p = a.map(v => Math.max(0,v)); const sum=p.reduce((x,y)=>x+y,0); return p.map(v=>sum ? 100*v/sum : 0); };
  // Ratios use the underlying (unrounded) five-marker profile.
  // A zero denominator gives no calculable numerical ratio, not infinity.
  function ratios(profile) {
    const oleic=profile[2],linoleic=profile[3],linolenic=profile[4];
    const divide=(a,b)=>Number.isFinite(a)&&Number.isFinite(b)&&a>=0&&b>0?a/b:null;
    return {oleicLinoleic:divide(oleic,linoleic),oleicLinolenic:divide(oleic,linolenic)};
  }
  const getOil = id => oils.find(o=>o.id===id);
  function rawProfile(code) {
    if (unknowns[code]) { const out=[0,0,0,0,0]; for(const [id,f] of unknowns[code]) normalise(getOil(id).profile).forEach((v,i)=>out[i]+=v*f); return out; }
    return normalise(getOil(code).profile);
  }
  // First five seeded MATLAB R2024b randn values for each fixed sample.
  // Keeping these constants preserves the reference app's oil profiles.
  const variation = {
    OLIVE:[-.14405941115792914,-1.1972765587310918,.17422651346277102,-.40699344847208119,.59710667673301232],
    SUNFLOWER:[-2.7099791439489826,-.88324470951614753,-.92810377528738564,-.81553191683898996,1.2489985687506848],
    SUNFLOWER_HO:[.66234360908909307,.79540482718526828,-.024080196436865649,1.4374141820979252,-.75330837638638903],
    SOYBEAN:[-.83400497320234368,-1.3875729231170133,-.92430473420102288,-1.6002298333735614,-.3125785047927922],
    RAPESEED_LE:[-.95930510003712466,1.9678908291947534,-.85675853480977815,1.1945773858994277,1.3345872322986772],
    MAIZE:[.51134569647187478,1.1648840041371018,1.8428484774853882,1.0432390939520775,.70564268168121314],
    PALM:[-.79461260860469007,-.28384828932041833,.75006191939891376,1.0797892795453494,-.083563216381808497],
    FLAXSEED:[.38136619921089987,-1.2338251938128397,-.23658538445788788,1.5247295389766529,-1.3948307486139098],
    U01:[-.16040375021474182,-1.138914978064667,.77376301111791568,.074415240883249981,.90485299660259744],
    U02:[.11644892421624722,1.2454106411199759,.3020914325558805,-2.242842592359588,.46367178118200708],
    U03:[-.59622219551903088,.21427609711551832,-1.3763109016875841,.43081292342729816,-.23652308533746383],
    U04:[-.080179124691410739,.71928764779305232,.97023460485201385,-.70230145701601554,1.3173950838734674],
    U05:[.17303881139567065,.13344581897491142,.16061478222590267,-.03243082871496579,.56852917833337513],
    U06:[1.678151526629841,.84812404554384213,.14724206168382944,.030765327698857297,.39536300101848532],
    U07:[.25094809947419427,1.2612331755104771,.093268207642356854,-1.4893192482600977,.30269728700989235],
    U08:[.2104791122201681,.91397907731112749,-.090327870573488206,.30120496785663708,.5072126681586806]
  };
  function profile(code) {
    return normalise(rawProfile(code).map((v,i)=>v+.35*variation[code][i]));
  }
  function temperatures(m) {
    const t = new Float64Array(6001);
    if(m.mode==='iso') { t.fill(m.isotherm); return t; }
    if(!m.program.length){t.fill(50);return t;}
    let elapsed=0, current=m.program[0].temp;
    for(const row of m.program) {
      const duration=Math.abs(row.temp-current)/Math.max(.1,row.ramp);
      for(let i=0;i<t.length;i++){const time=i*.01;if(time>=elapsed && time<elapsed+duration)t[i]=current+(row.temp-current)/duration*(time-elapsed);}
      elapsed+=duration; current=row.temp;
      for(let i=0;i<t.length;i++){const time=i*.01;if(time>=elapsed && time<elapsed+row.hold)t[i]=current;}
      elapsed+=row.hold;
    }
    for(let i=0;i<t.length;i++) if(i*.01>=elapsed)t[i]=current;
    return t;
  }
  function migration(row,m,temp=temperatures(m)) {
    const p=(m.pressure+14.7)*6894.76, po=101325, ratio=p/po;
    const j= Math.abs(ratio-1)<Number.EPSILON ? 1 : 1.5*(ratio**2-1)/(ratio**3-1);
    const radius=m.diameter/2000, phase=m.diameter*1000/(4*m.film);
    const mu0=m.gas==='H2'?.84e-5:m.gas==='N2'?1.66e-5:1.86e-5;
    const s=m.gas==='H2'?84.4:m.gas==='N2'?111:79;
    let distance=0,i=0;
    while(distance<m.length*100 && i<6000){
      const k=temp[i]+273.15, mu=mu0*(k/273.15)**1.5*((273.15+s)/(k+s));
      const u=(radius**2*(p**2-po**2)/(16*mu*m.length*po))*j*100;
      const pv=10**(row[6]-row[7]/(temp[i]+row[8]));
      const retentionFactor=(row[m.column==='polar'?10:9]/phase)*50*(760/Math.max(pv,.001));
      distance+=u/(1+retentionFactor)*.6;i++;
    }
    const tr=i*.01, plates=m.gas==='H2'?3500:m.gas==='N2'?2500:3000;
    let sigma=Math.max(.01,tr/Math.sqrt(plates*m.length));
    const maxT=Math.max(...temp); if(m.injector<maxT) sigma*=1+(maxT-m.injector)/50;
    return {tr,sigma,eluted:tr<60};
  }
  function peaks(rows, concentrations, m) {
    const temp=temperatures(m), split=m.injection==='split'?m.split+1:1;
    return rows.map((row,i)=>{const p=migration(row,m,temp),sens=m.detector==='FID'?row[5]/row[2]:(row[11]*40+row[12]*500)*m.voltage/2;
      const area=concentrations[i]*150*m.volume*sens/split;return {...p,row,area,height:area/(p.sigma*Math.sqrt(2*Math.PI)),concentration:concentrations[i]};});
  }
  function resolutions(p) { const sorted=[...p].sort((a,b)=>a.tr-b.tr); sorted.forEach((x,i)=>{x.rs=i?(x.tr-sorted[i-1].tr)/(1.7*(x.sigma+sorted[i-1].sigma)):null;}); return sorted; }
  function oilResult(code,m){ const relative=profile(code), p=peaks(markerRows.map(i=>groups.FAMES[i]),relative,m).map((v,i)=>({...v,marker:markers[i]})); const sorted=resolutions(p);return {code,relative,peaks:sorted,acceptable:p.every(v=>v.tr>.1&&v.eluted)&&sorted.slice(1).every(v=>v.rs>=1)}; }
  const api={groups,solvents,oils,unknowns,markers,normalise,profile,ratios,temperatures,migration,peaks,resolutions,oilResult};
  if(typeof module!=='undefined' && module.exports) module.exports=api;
  root.GCEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
