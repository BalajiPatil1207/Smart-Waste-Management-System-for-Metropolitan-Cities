import React, { useState, useEffect } from 'react';
import { Gamepad2, BookOpen, RotateCcw, AlertCircle, CheckCircle, HelpCircle, Leaf, ShieldAlert } from 'lucide-react';

const WASTE_ITEMS = [
  { name: "🍌 Banana Peel (केळीचे साल)", category: "wet", description: "Food waste decomposing easily into compost. (सेंद्रिय खतात रूपांतरित होते.)" },
  { name: "🍼 Plastic Bottle (प्लास्टिक बाटली)", category: "dry", description: "Recyclable plastic that should be washed and sorted. (पुनर्वापर करता येण्याजोगे प्लास्टिक.)" },
  { name: "🔋 Dead Battery (मृत बॅटरी)", category: "ewaste", description: "Contains toxic heavy metals. Needs specialist recycling. (घातक जड धातू असतात, विशेष रिसायकलिंग आवश्यक.)" },
  { name: "💉 Used Syringe (वापरलेली सुई)", category: "hazardous", description: "Medical waste. Poses biohazard risks. (वैद्यकीय कचरा, संसर्गजन्य धोका.)" },
  { name: "🍕 Leftover Pizza (शिळी पिझ्झा)", category: "wet", description: "Organic kitchen waste suitable for composting. (सेंद्रिय स्वयंपाकघर कचरा.)" },
  { name: "📦 Cardboard Box (पुठ्ठा बॉक्स)", category: "dry", description: "Paper fibers can be pulped and recycled. (कागद पुन्हा वापरण्यायोग्य बनवता येतो.)" },
  { name: "📱 Broken Smartphone (तुटलेला फोन)", category: "ewaste", description: "Contains valuable circuit metals like gold and lithium. (मौल्यवान धातू आणि लिथियम समाविष्ट असते.)" },
  { name: "🎨 Expired Paint Can (रंगाचा डबा)", category: "hazardous", description: "Chemical solvents pose toxic environmental risks. (रासायनिक द्रावण पर्यावरणास घातक असते.)" },
  { name: "🍂 Fallen Leaves (वाळलेली पाने)", category: "wet", description: "Garden leaf waste decomposing into leaf mold compost. (बागेतील पानांचा खत बनवण्यासाठी वापर होतो.)" },
  { name: "🥫 Aluminum Can (अ‍ॅल्युमिनियम कॅन)", category: "dry", description: "Metal can be melted down repeatedly with 95% energy savings. (धातू पुन्हा वितळवून नवीन वस्तू बनवता येतात.)" },
  { name: "💡 Burned LED Bulb (जळालेला बल्ब)", category: "ewaste", description: "Electronic glass and semiconductor components. (इलेक्ट्रॉनिक काच आणि अर्धसंवाहक भाग.)" },
  { name: "💊 Expired Tablets (मुदत संपलेली औषधे)", category: "hazardous", description: "Pharmaceutical chemicals which contaminate water tables if dumped. (औषध निर्माण रसायने, पाण्यात विरघळल्यास धोकादायक.)" }
];

const BINS = [
  { id: "wet", name: "Wet Waste", marathi: "ओला कचरा", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)", border: "#10b981", emoji: "🟢" },
  { id: "dry", name: "Dry Waste", marathi: "सुका कचरा", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.15)", border: "#3b82f6", emoji: "🔵" },
  { id: "ewaste", name: "E-Waste", marathi: "इलेक्ट्रॉनिक", color: "#eab308", bg: "rgba(234, 179, 8, 0.15)", border: "#eab308", emoji: "🟡" },
  { id: "hazardous", name: "Hazardous", marathi: "धोकादायक", color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)", border: "#ef4444", emoji: "🔴" }
];

export default function WasteSegregation() {
  const [activeTab, setActiveTab] = useState('game'); // 'game' or 'guide'
  const [shuffledItems, setShuffledItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [feedback, setFeedback] = useState(null); // { correct: true/false, msg: "" }
  const [gameOver, setGameOver] = useState(false);

  // Shuffle items on component mount or reset
  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    const shuffled = [...WASTE_ITEMS].sort(() => Math.random() - 0.5);
    setShuffledItems(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setLives(3);
    setFeedback(null);
    setGameOver(false);
  };

  const handleClassify = (binId) => {
    if (gameOver || feedback) return;

    const item = shuffledItems[currentIndex];
    const isCorrect = item.category === binId;

    // Trigger local beep sound for game feedback (using Web Audio API)
    playFeedbackSound(isCorrect);

    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedback({
        correct: true,
        msg: `बरोबर! ${item.name} हा योग्य कचरा आहे. ${item.description}`
      });
    } else {
      setLives(prev => {
        const nextLives = prev - 1;
        if (nextLives <= 0) {
          setGameOver(true);
        }
        return nextLives;
      });
      const correctBin = BINS.find(b => b.id === item.category);
      setFeedback({
        correct: false,
        msg: `चूक! ${item.name} हा '${correctBin.marathi} (${correctBin.name})' मध्ये टाकला पाहिजे. ${item.description}`
      });
    }
  };

  const playFeedbackSound = (isCorrect) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      if (isCorrect) {
        // Success Chime: two short rapid high tones
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.setValueAtTime(900, audioCtx.currentTime + 0.08);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.26);
      } else {
        // Error Buzz: low harsh tone
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.32);
      }
    } catch (e) {}
  };

  const handleNext = () => {
    setFeedback(null);
    if (currentIndex + 1 >= shuffledItems.length) {
      setGameOver(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const getEcoRating = () => {
    const pct = (score / shuffledItems.length) * 100;
    if (pct === 100) return { title: "🥇 Green Planet Champion!", marathi: "हरित पृथ्वी सम्राट!", desc: "तुम्ही कचरा वर्गीकरणात १००% तज्ज्ञ आहात!", color: "#10b981" };
    if (score >= 8) return { title: "🌿 Waste Sorting Expert", marathi: "कचरा वर्गीकरण तज्ज्ञ", desc: "खूप छान! तुम्ही पर्यावरणासाठी उत्कृष्ट काम करत आहात.", color: "#38bdf8" };
    if (score >= 5) return { title: "🌱 Eco Conscious Citizen", marathi: "पर्यावरण स्नेही नागरिक", desc: "चांगला प्रयत्न! कचऱ्याचे प्रकार अधिक नीट समजून घ्या.", color: "#fbbf24" };
    return { title: "🍂 Eco Learner", marathi: "पर्यावरण शिकाऊ", desc: "कचरा वर्गीकरणाची सवय लावण्यासाठी नियमित मार्गदर्शक वाचा.", color: "#f87171" };
  };

  const activeItem = shuffledItems[currentIndex];
  const ecoRating = getEcoRating();

  return (
    <div className="glass-panel pop-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.8rem' }}>
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc' }}>
          <Leaf size={24} color="#10b981" /> Smart Waste Segregation Hub
        </h2>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(15, 23, 42, 0.4)', padding: '4px', borderRadius: '8px' }}>
          <button 
            onClick={() => setActiveTab('game')}
            style={{
              padding: '0.4rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem',
              background: activeTab === 'game' ? '#38bdf8' : 'transparent',
              color: activeTab === 'game' ? '#0f172a' : '#cbd5e1',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Gamepad2 size={16} /> Play Game
          </button>
          <button 
            onClick={() => setActiveTab('guide')}
            style={{
              padding: '0.4rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem',
              background: activeTab === 'guide' ? '#38bdf8' : 'transparent',
              color: activeTab === 'guide' ? '#0f172a' : '#cbd5e1',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <BookOpen size={16} /> Eco Guide
          </button>
        </div>
      </div>

      {activeTab === 'game' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Game Status Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div className="glass-panel" style={{ padding: '0.6rem', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Score (गुण)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#38bdf8' }}>{score} / {shuffledItems.length}</div>
            </div>
            <div className="glass-panel" style={{ padding: '0.6rem', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Progress (प्रगती)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#cbd5e1' }}>{shuffledItems.length > 0 ? `${currentIndex + 1} / ${shuffledItems.length}` : '0/0'}</div>
            </div>
            <div className="glass-panel" style={{ padding: '0.6rem', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Lives (जीव)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ef4444' }}>
                {"❤️".repeat(Math.max(0, lives)) || "💔"}
              </div>
            </div>
          </div>

          {!gameOver && activeItem ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
              
              {/* Target Item Card */}
              <div className="glass-panel" style={{
                width: '100%', maxWidth: '420px', padding: '2rem', textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.1)', background: 'radial-gradient(circle, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.9) 100%)',
                borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                transform: 'scale(1)', transition: 'all 0.3s'
              }}>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', tracking: '2px', color: '#38bdf8', fontWeight: '700' }}>
                  Drop Item into the Correct Bin
                </span>
                <h3 style={{ fontSize: '1.8rem', margin: '1rem 0', color: '#fff' }}>{activeItem.name}</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>कचऱ्याचे वर्गीकरण करा आणि पर्यावरणाचे रक्षण करा!</p>
              </div>

              {/* Action Bins Selection Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', width: '100%' }}>
                {BINS.map(bin => (
                  <button
                    key={bin.id}
                    onClick={() => handleClassify(bin.id)}
                    disabled={feedback !== null}
                    style={{
                      background: bin.bg,
                      border: `2px solid ${bin.border}`,
                      borderRadius: '12px',
                      padding: '1.2rem 0.8rem',
                      color: bin.color,
                      fontWeight: 'bold',
                      cursor: feedback ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                    }}
                    onMouseOver={(e) => {
                      if (!feedback) {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = `0 10px 15px ${bin.bg}`;
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!feedback) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
                      }
                    }}
                  >
                    <span style={{ fontSize: '2rem' }}>{bin.emoji}</span>
                    <span style={{ fontSize: '0.95rem' }}>{bin.marathi}</span>
                    <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>{bin.name}</span>
                  </button>
                ))}
              </div>

              {/* Feedback Overlay Panel */}
              {feedback && (
                <div className="glass-panel" style={{
                  width: '100%', padding: '1rem 1.5rem', borderRadius: '12px',
                  border: `1px solid ${feedback.correct ? '#10b981' : '#ef4444'}`,
                  background: feedback.correct ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                  display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', textAlign: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: feedback.correct ? '#10b981' : '#ef4444' }}>
                    {feedback.correct ? <CheckCircle size={20} /> : <ShieldAlert size={20} />}
                    {feedback.correct ? "योग्य वर्गीकरण!" : "चूक वर्गीकरण!"}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#f8fafc', margin: 0 }}>{feedback.msg}</p>
                  <button 
                    onClick={handleNext}
                    style={{
                      marginTop: '6px', padding: '0.4rem 1.2rem', borderRadius: '6px', border: 'none',
                      background: feedback.correct ? '#10b981' : '#ef4444', color: '#fff',
                      fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}
                  >
                    Next Item ➔
                  </button>
                </div>
              )}

            </div>
          ) : (
            /* Game Over / Shuffling state */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem', textAlign: 'center', gap: '1.2rem' }}>
              <div style={{ fontSize: '4rem' }}>{score >= 8 ? '🏆' : '🌱'}</div>
              <h3 style={{ fontSize: '1.6rem', color: '#fff', margin: 0 }}>Game Completed!</h3>
              
              <div className="glass-panel" style={{ padding: '1.2rem', maxWidth: '400px', border: `1px solid ${ecoRating.color}`, background: 'rgba(15,23,42,0.5)' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: ecoRating.color, fontWeight: '800' }}>Your Title (पदवी)</span>
                <h4 style={{ fontSize: '1.3rem', margin: '0.3rem 0', color: ecoRating.color }}>{ecoRating.title}</h4>
                <div style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}>{ecoRating.marathi}</div>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>{ecoRating.desc}</p>
              </div>

              <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                Final Score: <span style={{ color: '#38bdf8' }}>{score}</span> / {shuffledItems.length}
              </div>

              <button 
                onClick={resetGame}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none',
                  background: 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)', color: '#fff',
                  fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(42,82,152,0.3)'
                }}
              >
                <RotateCcw size={16} /> Play Again (पुन्हा खेळा)
              </button>
            </div>
          )}

        </div>
      ) : (
        /* Smart Waste Guide Tab */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
            Learn how metropolitan cities sort solid waste correctly to prevent environmental dumps. (कचऱ्याचे वर्गीकरण करण्याचे नियम खालीलप्रमाणे आहेत):
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
            {BINS.map(bin => {
              const examples = WASTE_ITEMS.filter(item => item.category === bin.id);
              return (
                <div 
                  key={bin.id} 
                  className="glass-panel" 
                  style={{
                    padding: '1rem', border: `1.5px solid ${bin.border}`, 
                    background: bin.bg, borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', fontSize: '1.05rem', color: bin.color }}>
                    <span style={{ fontSize: '1.5rem' }}>{bin.emoji}</span>
                    {bin.marathi} ({bin.name})
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: '600' }}>
                    {bin.id === 'wet' && "🍽️ सेंद्रिय/किचन कचरा, विघटनशील"}
                    {bin.id === 'dry' && "📄 कागद, खोके, मेटल, रिसायकलिंग"}
                    {bin.id === 'ewaste' && "💻 बॅटरी, बल्ब, जुने इलेक्ट्रॉनिक्स"}
                    {bin.id === 'hazardous' && "🧴 केमिकल, औषधे, सिरिंज, रंगाचे डबे"}
                  </div>
                  <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Examples:</span>
                    <ul style={{ margin: '4px 0 0 0', paddingLeft: '1rem', fontSize: '0.8rem', color: '#f8fafc', lineHeight: '1.4' }}>
                      {examples.map((item, i) => (
                        <li key={i}>{item.name.split(' (')[0]}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
