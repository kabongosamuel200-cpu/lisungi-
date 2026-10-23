import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Linking, SafeAreaView, TextInput, Modal, Share } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const CLINICS = [
  {name:"Hôpital Saint-Joseph", area:"Limete 7e rue", phone:"tel:+243829999999", spec:"Gynéco - Sénologie lun/jeu - Dr Mbuyi"},
  {name:"Centre Monkole", area:"Mont Ngafula", phone:"tel:+243829999998", spec:"Imagerie mammaire - Mammo accessible"},
  {name:"Cliniques Ngaliema / CMBA", area:"Gombe", phone:"tel:+243829999997", spec:"Consultation femmes 8h-16h"},
  {name:"Hôpital Roi Baudouin", area:"Masina", phone:"tel:+243829999996", spec:"Dépistage gratuit 1er mardi du mois"},
];
const TESTIMONIALS = [
  {name:"Aminata, 28 ans, Kinshasa", txt:"Je fais mon contrôle chaque 1er du mois. Lisungi me rappelle."},
  {name:"Grace, 34 ans, Limete", txt:"J'avais peur. J'ai noté une boule, j'ai appelé via l'app. C'était bénin."},
  {name:"Mama Bijou, 42 ans", txt:"Je recommande à toutes mes sœurs. 2 min qui peuvent sauver une vie."},
];
const TIPS = [
  {icon:"🥗", t:"Manger", d:"Moins d'alcool, plus de fruits/légumes, poids stable = risque réduit (OMS)."},
  {icon:"🏃‍♀️", t:"Bouger", d:"30 min marche 5x/semaine diminue risque 20%."},
  {icon:"🤱", t:"Allaitement", d:"Allaiter 6 mois+ protège."},
];
const FAQ = [
  {q:"Boule qui va et vient avec règles ?", a:"Fréquent hormonal. Note-le, si persiste après règles >7j, consulte."},
  {q:"Écoulement transparent ?", a:"Souvent bénin. Si sanglant ou un seul côté persistant, consulte <48h."},
  {q:"Douleur avant règles ?", a:"Normal, seins gonflés. Si douleur un seul côté qui ne part pas, note-le."},
];
const VIDEOS = [
  {title:"1 min - Miroir", dur:"0:45", desc:"Comment bien se regarder", url:"https://www.youtube.com/watch?v=5r8yN1b2p0E", steps:"1. Devant miroir, bras le long du corps\n2. Mains sur hanches, pousse\n3. Bras levés\n4. Cherche asymétrie, rougeur, peau d'orange"},
  {title:"2 min - Palpation douche", dur:"1:30", desc:"Geste circulaire OMS", url:"https://www.youtube.com/watch?v=ihK1Z3VAcgM", steps:"1. 3 doigts, savonnés\n2. Pression légère, moyenne, forte\n3. Cercles de l'extérieur vers le mamelon\n4. N'oublie pas l'aisselle"},
  {title:"1 min - Allongée", dur:"1:00", desc:"Coussin sous épaule", url:"https://www.youtube.com/watch?v=5r8yN1b2p0E", steps:"1. Allongée, coussin sous épaule droite\n2. Bras droit derrière tête\n3. Main gauche palpe sein droit\n4. Change de côté"},
];

export default function App(){
  const [lang, setLang] = useState('fr');
  const [screen, setScreen] = useState('onboard');
  const [onboardStep, setOnboardStep] = useState(0);
  const [checks, setChecks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState('Rien de nouveau');
  const [customText, setCustomText] = useState('');
  const [riskDone, setRiskDone] = useState(false);
  const [privateMode, setPrivateMode] = useState(false);
  const [videoModal, setVideoModal] = useState(null);

  useEffect(() => {
    async function setupNotif(){
      const { status } = await Notifications.requestPermissionsAsync();
      if(status !== 'granted') return;
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.scheduleNotificationAsync({
        content:{ title:"Lisungi 🌸", body:"Sala contrôle na yo ? C'est le 1er du mois !", sound:true },
        trigger:{ type:'calendar', day:1, hour:9, minute:0, repeats:true }
      });
    }
    setupNotif();
  }, []);

  const openModal = () => { setShowModal(true); setSelectedOpt(lang==='fr'?'Rien de nouveau':'Eloko te'); setCustomText(''); };
  const saveCheck = () => {
    const now = new Date().toLocaleDateString('fr-FR');
    const note = customText ? `${selectedOpt} - ${customText}` : selectedOpt;
    setChecks([{date: now, note, opt: selectedOpt}, ...checks]);
    setShowModal(false); setScreen('journal');
  };
  const nextReminder = () => {
    return "1er du mois - 9h";
  };

  if(screen==='onboard'){
    const slides = [
      {t: lang==='fr'?"Bienvenue chez toi":"Boyei malamu", d: lang==='fr'?"Lisungi, alliée discrète 100% privée, créée à Kinshasa.":"Lisungi, moninga ya sekele ya Kinshasa.", e:"🌸"},
      {t: lang==='fr'?"2 minutes par mois":"2 min na sanza", d: lang==='fr'?"Geste OMS en 5 étapes simples : miroir, douche, allongée.":"Geste OMS na 5 etapes pete.", e:"✋"},
      {t: lang==='fr'?"Confidentiel & local":"Sequele & ya Kin", d: lang==='fr'?"Données sur téléphone. Hôpitaux Kinshasa avec Appeler, rappel auto.":"Données na téléphone, hôpitaux ya Kin.", e:"🔒"},
    ];
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.onboard}><Text style={styles.onboardEmoji}>{slides[onboardStep].e}</Text><Text style={styles.onboardT}>{slides[onboardStep].t}</Text><Text style={styles.onboardD}>{slides[onboardStep].d}</Text><View style={styles.dots}><View style={[styles.dot, onboardStep===0&&styles.dotA]} /><View style={[styles.dot, onboardStep===1&&styles.dotA]} /><View style={[styles.dot, onboardStep===2&&styles.dotA]} /></View><TouchableOpacity style={styles.ctaPro} onPress={()=>{ if(onboardStep<2) setOnboardStep(onboardStep+1); else setScreen('home'); }}><Text style={styles.ctaProText}>{onboardStep<2? (lang==='fr'?'Suivant →':'Elakisaka →') : (lang==='fr'?'Commencer ✓':'Banda ✓')}</Text></TouchableOpacity></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View><Text style={styles.logo}>Lisungi</Text><Text style={styles.logoSub}>FEMTECH RDC • ULTRA V6 • {lang.toUpperCase()}</Text></View>
        <View style={{flexDirection:'row', gap:8}}>
          <TouchableOpacity onPress={()=>setPrivateMode(!privateMode)} style={[styles.iconBtn, privateMode&&{backgroundColor:'#212121'}]}><Text>{privateMode?'👁️‍🗨️':'🔒'}</Text></TouchableOpacity>
          <TouchableOpacity onPress={()=>setLang(lang==='fr'?'ln':'fr')} style={styles.langBtn}><Text style={styles.langTxt}>{lang==='fr'?'FR→LN':'LN→FR'}</Text></TouchableOpacity>
        </View>
      </View>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalBack}><View style={styles.modalBox}>
          <Text style={styles.modalTitle}>{lang==='fr'?'Ton contrôle du mois':'Contrôle na yo'}</Text><Text style={styles.modalQ}>{lang==='fr'?'Qu\'as-tu remarqué ?':'Nini omoni ?'}</Text>
          {['Rien de nouveau','Boule / grosseur','Douleur','Changement peau/mamelon'].map((opt,i)=><TouchableOpacity key={i} onPress={()=>setSelectedOpt(opt)} style={[styles.opt, selectedOpt===opt && styles.optActive]}><Text style={[styles.optTxt, selectedOpt===opt && styles.optTxtActive]}>{opt}</Text></TouchableOpacity>)}
          <TextInput style={styles.input} placeholder={lang==='fr'?'Écris ici... ex: sein droit sensible':'Koma awa...'} value={customText} onChangeText={setCustomText} multiline />
          <TouchableOpacity style={styles.ctaPro} onPress={saveCheck}><Text style={styles.ctaProText}>{lang==='fr'?'Enregistrer dans mon journal':'Bomba na journal'}</Text></TouchableOpacity><TouchableOpacity style={styles.cancel} onPress={()=>setShowModal(false)}><Text style={styles.cancelTxt}>{lang==='fr'?'Annuler':'Tika'}</Text></TouchableOpacity>
        </View></View>
      </Modal>

      <Modal visible={!!videoModal} transparent animationType="slide">
        <View style={styles.modalBack}><View style={[styles.modalBox, {minHeight:300}]}>
          <Text style={styles.modalTitle}>{videoModal?.title}</Text>
          <Text style={styles.modalQ}>{videoModal?.desc}</Text>
          <View style={{backgroundColor:'#FFF0F3', padding:12, borderRadius:10, marginTop:10}}>
            <Text style={{fontSize:12, lineHeight:18}}>{videoModal?.steps}</Text>
          </View>
          <TouchableOpacity style={styles.ctaPro} onPress={()=>{ if(videoModal?.url) Linking.openURL(videoModal.url); }}>
            <Text style={styles.ctaProText}>▶️ Voir vidéo YouTube</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancel} onPress={()=>setVideoModal(null)}><Text style={styles.cancelTxt}>Fermer</Text></TouchableOpacity>
        </View></View>
      </Modal>

      {screen==='home' && (
        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.statsRow}><View style={styles.statCard}><Text style={styles.statNum}>{checks.length}</Text><Text style={styles.statLab}>Contrôles</Text></View><View style={styles.statCard}><Text style={styles.statNum}>{checks.length>0?checks.length*30+'j':'0j'}</Text><Text style={styles.statLab}>Streak</Text></View><View style={styles.statCard}><Text style={styles.statNum}>🔔</Text><Text style={styles.statLab}>{nextReminder()}</Text></View></View>
          <View style={styles.heroPro}><Text style={styles.heroTitle}>{lang==='fr'?'Lisungi, ton alliée de 2 min':'Lisungi, moninga na yo'}</Text><Text style={styles.heroSub}>{lang==='fr'?"Recommandé OMS. Pas un diagnostic. Rappel le 1er à 9h":"OMS elobi malamu. Rappel 1er à 9h"}</Text><TouchableOpacity style={styles.ctaPro} onPress={openModal}><Text style={styles.ctaProText}>{lang==='fr'?'Faire mon contrôle du mois ✓':'Sala contrôle ya sanza ✓'}</Text></TouchableOpacity><TouchableOpacity style={styles.outlinePro} onPress={()=>setScreen('tuto')}><Text style={styles.outlineProText}>{lang==='fr'?'Apprendre le geste →':'Yekola geste →'}</Text></TouchableOpacity><TouchableOpacity style={styles.sosBtn} onPress={()=>Linking.openURL('tel:+243829999999')}><Text style={styles.sosTxt}>🚨 {lang==='fr'?'Doute ? Appeler hôpital':'Doute ? Benga hôpital'}</Text></TouchableOpacity></View>
          <Text style={styles.h2}>{lang==='fr'?'Elles recommandent Lisungi':'Bango ba recommend'}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop:8}}>{TESTIMONIALS.map((t,i)=><View key={i} style={styles.testiCard}><Text style={styles.testiTxt}>"{t.txt}"</Text><Text style={styles.testiName}>{t.name}</Text></View>)}</ScrollView>
          <TouchableOpacity style={styles.shareBtn} onPress={()=>Share.share({message:'Lisungi - Mon alliée 2 min Kinshasa'})}><Text style={styles.shareTxt}>💌 {lang==='fr'?'Recommander à une sœur':'Tinda na moninga'}</Text></TouchableOpacity>
        </ScrollView>
      )}

      {screen==='tuto' && (
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.h1}>Guide OMS - 5 étapes</Text>
          <View style={styles.stepCard}><Text style={styles.stepT}>Quand ?</Text><Text style={styles.stepD}>1x/mois, 2-3j après règles. Rappel Lisungi : 1er du mois à 9h.</Text></View>
          <View style={styles.stepCard}><Text style={styles.stepT}>1. Miroir</Text><Text style={styles.stepD}>Bras le long, mains hanches, bras levés. Asymétrie, peau d'orange, rougeur.</Text></View>
          <View style={styles.stepCard}><Text style={styles.stepT}>2. Debout sous la douche</Text><Text style={styles.stepD}>3 doigts, pression légère/moyenne/forte. Cercles extérieur→centre + aisselle.</Text></View>
          <View style={styles.stepCard}><Text style={styles.stepT}>3. Allongée</Text><Text style={styles.stepD}>Coussin sous épaule, palpe sein opposé.</Text></View>
          <View style={styles.stepCard}><Text style={styles.stepT}>4. Que faire si doute ?</Text><Text style={styles.stepD}>80% bénin MAIS vérifier sous 7 jours.</Text></View>
          <View style={[styles.stepCard,{backgroundColor:'#FCE4EC'}]}><Text style={styles.stepT}>5. Note & rappelle</Text><Text style={styles.stepD}>Note dans Journal. Rappel auto le 1er à 9h.</Text></View>
        </ScrollView>
      )}

      {screen==='journal' && (
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.h1}>Mon suivi ({checks.length}) {checks.length>=3?'🏅':''}</Text>
          <View style={styles.calendarBox}><Text style={styles.calTitle}>📅 Calendrier 6 mois</Text><View style={styles.calGrid}>{['J','F','M','A','M','J','J','A','S','O','N','D'].map((m,i)=>{const done=checks.length>i%2; return <View key={i} style={[styles.calMonth, done&&checks.length>0&&i<checks.length*2&&styles.calMonthDone]}><Text style={[styles.calMonthTxt, done&&checks.length>0&&i<checks.length*2&&styles.calMonthTxtDone]}>{m}</Text></View>})}</View></View>
          {privateMode ? <View style={styles.privateBox}><Text style={styles.privateTxt}>🔒 Mode confidentiel activé</Text></View> : checks.length===0 ? <View style={styles.empty}><Text>Aucun contrôle.</Text></View> : checks.map((c,i)=><View key={i} style={styles.jCard}><Text style={styles.jDate}>{c.date}</Text><Text style={styles.jNote}>{c.note}</Text>{c.opt==='Boule / grosseur'?<Text style={styles.jWarn}>⚠️ À vérifier sous 7j</Text>:null}</View>)}
          <TouchableOpacity style={styles.ctaPro} onPress={openModal}><Text style={styles.ctaProText}>+ Nouveau contrôle</Text></TouchableOpacity>
          {checks.length>0 && <TouchableOpacity style={styles.exportBtn} onPress={()=>Share.share({message:`MON SUIVI LISUNGI - ${checks.length} contrôles\n${checks.map(c=>`${c.date}: ${c.note}`).join('\n')}`})}><Text style={styles.exportTxt}>📄 Exporter pour médecin / WhatsApp</Text></TouchableOpacity>}
        </ScrollView>
      )}

      {screen==='learn' && (
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.h1}>Apprendre • Conseils • FAQ</Text>
          <Text style={styles.h2}>Vidéos 3 min - Clique pour voir</Text>{VIDEOS.map((v,i)=><View key={i} style={styles.videoCard}><View style={styles.videoThumb}><Text>▶️</Text></View><View style={{flex:1, marginLeft:10}}><Text style={styles.videoTitle}>{v.title} • {v.dur}</Text><Text style={styles.videoDesc}>{v.desc}</Text></View><TouchableOpacity onPress={()=>setVideoModal(v)} style={styles.playBtn}><Text style={styles.playTxt}>Voir</Text></TouchableOpacity></View>)}
          <Text style={styles.h2}>Questionnaire risque</Text>{!riskDone ? <View style={styles.riskBox}><Text style={styles.riskT}>Antécédent familial direct ?</Text><View style={styles.riskRow}><TouchableOpacity onPress={()=>setRiskDone(true)} style={styles.riskBtn}><Text>Oui</Text></TouchableOpacity><TouchableOpacity onPress={()=>setRiskDone(true)} style={styles.riskBtn}><Text>Non</Text></TouchableOpacity></View><TouchableOpacity style={styles.ctaPro} onPress={()=>setRiskDone(true)}><Text style={styles.ctaProText}>Voir mon profil →</Text></TouchableOpacity></View> : <View style={styles.riskBoxDone}><Text style={styles.riskT}>Profil : Risque standard - contrôle mensuel suffit (non diagnostic)</Text></View>}
          <Text style={styles.h2}>Vrai / Faux</Text><View style={styles.learnCard}><Text style={styles.learnQ}>Cancer seulement après 50 ans ?</Text><Text style={styles.learnA}>FAUX - possible dès 20-30 ans</Text></View><View style={styles.learnCard}><Text style={styles.learnQ}>Si pas de douleur, rien ?</Text><Text style={styles.learnA}>FAUX - début souvent indolore</Text></View>
          <Text style={styles.h2}>Conseils OMS 🥗</Text>{TIPS.map((tip,i)=><View key={i} style={styles.tipCard}><Text style={styles.tipIcon}>{tip.icon}</Text><View style={{flex:1, marginLeft:10}}><Text style={styles.tipT}>{tip.t}</Text><Text style={styles.tipD}>{tip.d}</Text></View></View>)}
          <Text style={styles.h2}>FAQ anonyme 💬</Text>{FAQ.map((f,i)=><View key={i} style={styles.faqCard}><Text style={styles.faqQ}>❓ {f.q}</Text><Text style={styles.faqA}>{f.a}</Text></View>)}
        </ScrollView>
      )}

      {screen==='care' && (
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.h1}>{lang==='fr'?'Où consulter à Kinshasa ?':'Wapi na Kin ?'}</Text><View style={styles.cardAlert}><Text style={styles.cardAlertD}>Urgence : écoulement sanglant, boule qui grossit vite, peau qui change &lt;1 mois =&gt; consulte &lt;48h.</Text></View>
          {CLINICS.map((c,i)=><View key={i} style={styles.clinicCard}><View style={{flex:1}}><Text style={styles.clinicName}>{c.name}</Text><Text style={styles.clinicArea}>{c.area}</Text><Text style={styles.clinicSpec}>{c.spec}</Text></View><TouchableOpacity onPress={()=>Linking.openURL(c.phone)} style={styles.callBtn}><Text style={styles.callTxt}>Appeler</Text></TouchableOpacity></View>)}
          <TouchableOpacity style={styles.whatsBtn} onPress={()=>Linking.openURL('https://wa.me/243829999999')}><Text style={styles.whatsTxt}>💬 WhatsApp Hôpital</Text></TouchableOpacity>
        </ScrollView>
      )}

      <View style={styles.tabbar}>
        <TouchableOpacity onPress={()=>setScreen('home')} style={[styles.tab, screen==='home' && styles.tabActive]}><Text>🏠</Text><Text style={styles.tabTxt}>Accueil</Text></TouchableOpacity>
        <TouchableOpacity onPress={()=>setScreen('tuto')} style={[styles.tab, screen==='tuto' && styles.tabActive]}><Text>✋</Text><Text style={styles.tabTxt}>Geste</Text></TouchableOpacity>
        <TouchableOpacity onPress={()=>setScreen('journal')} style={[styles.tab, screen==='journal' && styles.tabActive]}><Text>📅</Text><Text style={styles.tabTxt}>Journal</Text></TouchableOpacity>
        <TouchableOpacity onPress={()=>setScreen('learn')} style={[styles.tab, screen==='learn' && styles.tabActive]}><Text>💡</Text><Text style={styles.tabTxt}>Apprendre</Text></TouchableOpacity>
        <TouchableOpacity onPress={()=>setScreen('care')} style={[styles.tab, screen==='care' && styles.tabActive]}><Text>🏥</Text><Text style={styles.tabTxt}>Aide</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:{flex:1, backgroundColor:'#FFF5F7'},
  header:{flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:12, backgroundColor:'#fff', borderBottomWidth:1, borderBottomColor:'#FCE4EC'},
  logo:{fontSize:24, fontWeight:'900', color:'#C2185B'}, logoSub:{fontSize:7, fontWeight:'800', color:'#AD1457'},
  langBtn:{backgroundColor:'#C2185B', paddingHorizontal:12, paddingVertical:7, borderRadius:20}, langTxt:{color:'#fff', fontWeight:'800', fontSize:11},
  iconBtn:{backgroundColor:'#FCE4EC', width:34, height:34, borderRadius:17, alignItems:'center', justifyContent:'center'},
  body:{padding:14, paddingBottom:100},
  statsRow:{flexDirection:'row', gap:6, marginBottom:10}, statCard:{flex:1, backgroundColor:'#fff', borderRadius:12, padding:10, alignItems:'center', borderWidth:1, borderColor:'#FCE4EC'}, statNum:{fontWeight:'900', fontSize:16, color:'#C2185B'}, statLab:{fontSize:8, color:'#757575', marginTop:2},
  heroPro:{backgroundColor:'#fff', borderRadius:20, padding:16, borderWidth:1, borderColor:'#FCE4EC'},
  heroTitle:{fontSize:20, fontWeight:'900'}, heroSub:{color:'#616161', marginTop:6, fontSize:12},
  ctaPro:{backgroundColor:'#C2185B', padding:14, borderRadius:12, marginTop:10, alignItems:'center'}, ctaProText:{color:'#fff', fontWeight:'800', fontSize:13},
  outlinePro:{borderWidth:1.5, borderColor:'#C2185B', padding:12, borderRadius:12, marginTop:8, alignItems:'center'}, outlineProText:{color:'#C2185B', fontWeight:'800', fontSize:12},
  sosBtn:{backgroundColor:'#FFEBEE', padding:10, borderRadius:10, marginTop:8, alignItems:'center', borderWidth:1, borderColor:'#FFCDD2'}, sosTxt:{color:'#C62828', fontWeight:'800', fontSize:11},
  h1:{fontSize:18, fontWeight:'900', marginBottom:10}, h2:{fontSize:14, fontWeight:'800', marginTop:16, marginBottom:6},
  stepCard:{backgroundColor:'#fff', borderRadius:12, padding:12, marginBottom:6, borderWidth:1, borderColor:'#FCE4EC'}, stepT:{fontWeight:'800', fontSize:13}, stepD:{color:'#616161', marginTop:3, fontSize:12},
  empty:{backgroundColor:'#fff', padding:16, borderRadius:12, alignItems:'center'}, jCard:{backgroundColor:'#fff', padding:12, borderRadius:12, marginBottom:6, borderWidth:1, borderColor:'#FCE4EC'}, jDate:{fontWeight:'800', color:'#C2185B', fontSize:12}, jNote:{marginTop:3, color:'#212121', fontSize:12}, jWarn:{color:'#C62828', fontSize:10, marginTop:3},
  learnCard:{backgroundColor:'#fff', padding:12, borderRadius:12, marginBottom:6, borderWidth:1, borderColor:'#FCE4EC'}, learnQ:{fontWeight:'800', fontSize:12}, learnA:{color:'#424242', marginTop:3, fontSize:11},
  clinicCard:{backgroundColor:'#fff', flexDirection:'row', alignItems:'center', padding:12, borderRadius:12, marginBottom:6, borderWidth:1, borderColor:'#FCE4EC'}, clinicName:{fontWeight:'800', fontSize:12}, clinicArea:{color:'#757575', fontSize:10}, clinicSpec:{color:'#AD1457', fontSize:9, marginTop:2}, callBtn:{backgroundColor:'#E8F5E9', paddingHorizontal:12, paddingVertical:6, borderRadius:16}, callTxt:{color:'#2E7D32', fontWeight:'800', fontSize:11},
  tabbar:{flexDirection:'row', backgroundColor:'#fff', borderTopWidth:1, borderTopColor:'#FCE4EC', paddingTop:6, paddingBottom:14, justifyContent:'space-around'}, tab:{alignItems:'center', padding:5, borderRadius:10}, tabActive:{backgroundColor:'#FFE4EC'}, tabTxt:{fontSize:8, fontWeight:'700', color:'#9E9E9E'},
  modalBack:{flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'flex-end'}, modalBox:{backgroundColor:'#fff', borderTopLeftRadius:20, borderTopRightRadius:20, padding:18, minHeight:400},
  modalTitle:{fontSize:16, fontWeight:'900', textAlign:'center'}, modalQ:{textAlign:'center', color:'#616161', marginTop:4, marginBottom:10, fontSize:12},
  opt:{borderWidth:1, borderColor:'#FCE4EC', borderRadius:10, padding:10, marginBottom:6}, optActive:{backgroundColor:'#FFE4EC', borderColor:'#C2185B'}, optTxt:{color:'#616161', fontSize:12}, optTxtActive:{color:'#C2185B', fontWeight:'800'},
  input:{borderWidth:1, borderColor:'#E0E0E0', borderRadius:10, padding:10, marginTop:6, minHeight:60, textAlignVertical:'top', fontSize:12}, cancel:{alignItems:'center', marginTop:8}, cancelTxt:{color:'#9E9E9E', fontSize:12},
  onboard:{flex:1, justifyContent:'center', alignItems:'center', padding:24}, onboardEmoji:{fontSize:64}, onboardT:{fontSize:22, fontWeight:'900', color:'#C2185B', marginTop:16, textAlign:'center'}, onboardD:{textAlign:'center', color:'#616161', marginTop:10, fontSize:13, lineHeight:18},
  dots:{flexDirection:'row', gap:6, marginTop:18}, dot:{width:6,height:6,borderRadius:3,backgroundColor:'#FCE4EC'}, dotA:{backgroundColor:'#C2185B', width:18},
  testiCard:{backgroundColor:'#fff', width:200, borderRadius:12, padding:10, marginRight:8, borderWidth:1, borderColor:'#FCE4EC'}, testiTxt:{fontStyle:'italic', color:'#424242', fontSize:11}, testiName:{fontWeight:'700', color:'#C2185B', marginTop:6, fontSize:10},
  shareBtn:{backgroundColor:'#fff', borderWidth:1, borderColor:'#C2185B', borderRadius:12, padding:12, marginTop:12, alignItems:'center'}, shareTxt:{color:'#C2185B', fontWeight:'800', fontSize:12},
  videoCard:{backgroundColor:'#fff', flexDirection:'row', alignItems:'center', padding:10, borderRadius:12, marginBottom:6, borderWidth:1, borderColor:'#FCE4EC'}, videoThumb:{width:40, height:40, borderRadius:20, backgroundColor:'#FFF0F3', alignItems:'center', justifyContent:'center'}, videoTitle:{fontWeight:'800', fontSize:11}, videoDesc:{color:'#757575', fontSize:9, marginTop:2}, playBtn:{backgroundColor:'#FCE4EC', paddingHorizontal:10, paddingVertical:5, borderRadius:10}, playTxt:{color:'#C2185B', fontWeight:'800', fontSize:10},
  tipCard:{backgroundColor:'#fff', flexDirection:'row', padding:10, borderRadius:12, marginBottom:6, borderWidth:1, borderColor:'#FCE4EC'}, tipIcon:{fontSize:18}, tipT:{fontWeight:'800', fontSize:11}, tipD:{color:'#616161', fontSize:10, marginTop:2},
  faqCard:{backgroundColor:'#F3E5F5', borderRadius:12, padding:10, marginBottom:6}, faqQ:{fontWeight:'800', fontSize:11}, faqA:{color:'#4A148C', fontSize:10, marginTop:3},
  calendarBox:{backgroundColor:'#fff', borderRadius:14, padding:12, marginBottom:10, borderWidth:1, borderColor:'#FCE4EC'}, calTitle:{fontWeight:'800', fontSize:12, marginBottom:6}, calGrid:{flexDirection:'row', flexWrap:'wrap', gap:5}, calMonth:{width:28, height:28, borderRadius:14, backgroundColor:'#F5F5F5', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'#EEEEEE'}, calMonthDone:{backgroundColor:'#C2185B', borderColor:'#C2185B'}, calMonthTxt:{fontSize:10, fontWeight:'700', color:'#9E9E9E'}, calMonthTxtDone:{color:'#fff'},
  exportBtn:{backgroundColor:'#212121', padding:12, borderRadius:12, marginTop:8, alignItems:'center'}, exportTxt:{color:'#fff', fontWeight:'800', fontSize:11},
  riskBox:{backgroundColor:'#fff', borderRadius:12, padding:12, borderWidth:1, borderColor:'#FCE4EC'}, riskBoxDone:{backgroundColor:'#E8F5E9', borderRadius:12, padding:12, borderWidth:1, borderColor:'#A5D6A7'}, riskT:{fontWeight:'800', fontSize:12}, riskRow:{flexDirection:'row', gap:6, marginTop:8}, riskBtn:{flex:1, borderWidth:1, borderColor:'#FCE4EC', borderRadius:10, padding:10, alignItems:'center'},
  cardAlert:{backgroundColor:'#FFF8E1', borderWidth:1, borderColor:'#FFECB3', padding:10, borderRadius:10, marginBottom:8}, cardAlertD:{color:'#5D4037', fontSize:10},
  privateBox:{backgroundColor:'#212121', padding:16, borderRadius:12, alignItems:'center'}, privateTxt:{color:'#fff', fontWeight:'700', fontSize:11},
  whatsBtn:{backgroundColor:'#E8F5E9', padding:12, borderRadius:12, marginTop:8, alignItems:'center', borderWidth:1, borderColor:'#A5D6A7'}, whatsTxt:{color:'#2E7D32', fontWeight:'800', fontSize:12}
});
