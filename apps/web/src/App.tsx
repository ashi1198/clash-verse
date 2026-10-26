import { useEffect, useState } from "react";
import AnimeCard from "./components/AnimeCard";

type Screen = "home" | "leagues" | "battle" | "collection" | "cardlab";

const Icon = ({ name, size = 18 }: { name: string; size?: number }) => {
  const paths: Record<string, React.ReactNode> = {
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10M9 20v-6h6v6" />
      </>
    ),
    cards: (
      <>
        <rect x="4" y="3" width="13" height="18" rx="2" />
        <path d="m9 7 3-2 3 2-3 5Z" />
        <path d="M19 6h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-1" />
      </>
    ),
    sword: (
      <>
        <path d="m14.5 17.5-8-8L4 12l8 8 2.5-2.5Z" />
        <path d="m7 10 8.5-7.5 4 4L12 15M16 8l3 3" />
      </>
    ),
    trophy: (
      <>
        <path d="M8 21h8M12 17v4" />
        <path d="M6 3h12v5a6 6 0 0 1-12 0Z" />
        <path d="M6 5H3v2a4 4 0 0 0 4 4M18 5h3v2a4 4 0 0 1-4 4" />
      </>
    ),
    bolt: <path d="m13 2-8 12h6l-1 8 9-13h-6Z" />,
    shield: <path d="M12 3 4 6v5c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V6Z" />,
    flame: (
      <path d="M12 22c4 0 7-3 7-7 0-3-2-6-5-9 0 3-2 4-3 5 0-3-1-6-3-9 0 5-3 7-3 12 0 4 3 8 7 8Z" />
    ),
    arrow: (
      <>
        <path d="M5 12h14M14 7l5 5-5 5" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="4" />
        <path d="M2 21v-2a6 6 0 0 1 12 0v2M16 5a4 4 0 0 1 0 7M17 15a6 6 0 0 1 5 6" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
};

const universes = [
  {
    id: "onepiece",
    name: "ONE PIECE",
    sub: "Grand Line",
    color: "gold",
    leagues: 12,
    online: "18.4K",
  },
  {
    id: "naruto",
    name: "NARUTO",
    sub: "Shinobi World",
    color: "orange",
    leagues: 9,
    online: "14.2K",
  },
  {
    id: "demonslayer",
    name: "DEMON SLAYER",
    sub: "Taisho Era",
    color: "teal",
    leagues: 7,
    online: "9.8K",
  },
  {
    id: "jujutsu",
    name: "JUJUTSU KAISEN",
    sub: "Cursed Realm",
    color: "violet",
    leagues: 6,
    online: "7.5K",
  },
];

const cards = [
  {
    name: "MONKEY D. LUFFY",
    title: "GEAR SECOND",
    power: 2480,
    type: "STRIKER",
    cost: 3,
    color: "red",
  },
  {
    name: "RORONOA ZORO",
    title: "THREE SWORD STYLE",
    power: 2320,
    type: "BREAKER",
    cost: 4,
    color: "green",
  },
  {
    name: "NICO ROBIN",
    title: "CIEN FLEUR",
    power: 2050,
    type: "CONTROL",
    cost: 3,
    color: "violet",
  },
  {
    name: "SANJI",
    title: "DIABLE JAMBE",
    power: 2180,
    type: "STRIKER",
    cost: 3,
    color: "blue",
  },
];

function GameCard({
  card,
  index,
  selected,
  onClick,
}: {
  card: (typeof cards)[0];
  index: number;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className={`tcg-card ${card.color} ${selected ? "selected" : ""}`}
      onClick={onClick}
    >
      <div className="tcg-frame">
        <div className="tcg-head">
          <span>{card.name}</span>
          <b>{card.cost}</b>
        </div>
        <div className="tcg-art">
          <div className="card-sun" />
          <div className="card-figure">
            <i />
            <i />
            <i />
          </div>
          <span>SR · 0{index + 1}</span>
          <b className="tcg-rarity">
            {index === 0 ? "LEGEND" : index < 3 ? "ALL-STAR" : "RISING"}
          </b>
        </div>
        <div className="tcg-title">
          <strong>{card.title}</strong>
          <small>{card.type}</small>
        </div>
        <p>
          {index === 1
            ? "Breaks DEF stance. +20% damage after a perfect guard."
            : index === 2
              ? "Reveal one enemy card before committing your stance."
              : "Gains momentum when played after a crew card."}
        </p>
        <div className="tcg-stats">
          <span>
            ATK <b>{card.power}</b>
          </span>
          <span>
            DEF <b>{Math.round(card.power * 0.72)}</b>
          </span>
        </div>
        <div className="tcg-stars">
          {[1, 2, 3, 4, 5].map((n) => (
            <i className={n <= 5 - index ? "on" : ""} key={n}>
              ★
            </i>
          ))}
        </div>
      </div>
    </button>
  );
}

function Nav({ screen, go }: { screen: Screen; go: (s: Screen) => void }) {
  return (
    <aside className="sidebar">
      <button className="brand brand-button" onClick={() => go("home")}>
        <span className="brand-mark">V</span>
        <span>
          VERSE
          <br />
          CLASH
        </span>
      </button>
      <nav>
        <button
          className={`nav-item ${screen === "home" ? "active" : ""}`}
          onClick={() => go("home")}
        >
          <Icon name="home" />
          <span>Discover</span>
        </button>
        <button
          className={`nav-item ${screen === "leagues" ? "active" : ""}`}
          onClick={() => go("leagues")}
        >
          <Icon name="trophy" />
          <span>Leagues</span>
        </button>
        <button
          className={`nav-item ${screen === "battle" ? "active" : ""}`}
          onClick={() => go("battle")}
        >
          <Icon name="sword" />
          <span>Battle</span>
        </button>
        <button
          className={`nav-item ${screen === "collection" ? "active" : ""}`}
          onClick={() => go("collection")}
        >
          <Icon name="cards" />
          <span>Collection</span>
          <b>28</b>
        </button>
        <button
          className={`nav-item ${screen === "cardlab" ? "active" : ""}`}
          onClick={() => go("cardlab")}
        >
          <Icon name="flame" />
          <span>Card canvas</span>
        </button>
      </nav>
      <div className="season-card">
        <span className="eyebrow">CROSSVERSE SEASON</span>
        <strong>Worlds Collide</strong>
        <div className="season-row">
          <span>18 days left</span>
          <span>Rank 842</span>
        </div>
        <div className="meter">
          <i />
        </div>
      </div>
      <button className="profile">
        <span className="avatar">K</span>
        <span>
          <strong>Captain Kai</strong>
          <small>Gold III</small>
        </span>
      </button>
    </aside>
  );
}

function Topbar({ title }: { title: string }) {
  return (
    <header>
      <div>
        <span className="eyebrow">VERSE CLASH / ONLINE</span>
        <h1>{title}</h1>
      </div>
      <div className="resource">
        <Icon name="bolt" />
        <span>
          <small>ENERGY</small>
          <strong>42 / 60</strong>
        </span>
        <button>+</button>
      </div>
      <span className="online-pill">
        <i /> 51,284 online
      </span>
    </header>
  );
}

function Home({ go }: { go: (s: Screen) => void }) {
  return (
    <>
      <Topbar title="Choose your universe" />
      <div className="content home-content">
        <section className="cross-hero">
          <div className="hero-copy">
            <span className="eyebrow">CROSS-ANIME BATTLE PLATFORM</span>
            <h2>
              BUILD YOUR LEGACY
              <br />
              <em>ACROSS WORLDS.</em>
            </h2>
            <p>
              Master each universe. Build unique decks. Then bring your
              strongest fighters into the Crossverse Arena.
            </p>
            <div>
              <button className="fight-button" onClick={() => go("battle")}>
                QUICK BATTLE <Icon name="arrow" />
              </button>
              <button className="ghost-button" onClick={() => go("leagues")}>
                EXPLORE LEAGUES
              </button>
            </div>
          </div>
          <div className="hero-emblem">
            <span>V</span>
            <i>SEASON 01</i>
          </div>
          <div className="hero-stats">
            <span>
              <b>4</b> WORLDS
            </span>
            <span>
              <b>34</b> LEAGUES
            </span>
            <span>
              <b>240+</b> CARDS
            </span>
          </div>
        </section>

        <div className="home-grid">
          <section>
            <div className="section-heading">
              <div>
                <span className="eyebrow">SELECT A WORLD</span>
                <h2>Anime universes</h2>
              </div>
              <span className="rank-note">
                Each world has a unique deck & mechanics
              </span>
            </div>
            <div className="universe-grid">
              {universes.map((u, i) => (
                <button
                  className={`universe-card ${u.color}`}
                  key={u.id}
                  onClick={() => i === 0 && go("leagues")}
                >
                  <div className="universe-art">
                    <span>{u.name.charAt(0)}</span>
                    <div className="world-ring" />
                  </div>
                  <div className="universe-info">
                    <span className="universe-no">WORLD 0{i + 1}</span>
                    <h3>{u.name}</h3>
                    <p>{u.sub}</p>
                    <div>
                      <span>{u.leagues} leagues</span>
                      <span>
                        <i /> {u.online} online
                      </span>
                    </div>
                  </div>
                  {i > 0 && <span className="coming">COMING SOON</span>}
                </button>
              ))}
            </div>
          </section>
          <aside className="leaderboard">
            <div className="section-heading">
              <div>
                <span className="eyebrow">GLOBAL RANKING</span>
                <h2>Top challengers</h2>
              </div>
              <Icon name="trophy" />
            </div>
            {["ACE.K", "SHADOW7", "NAMI.W", "GOJOX", "KAIZOKU"].map(
              (name, i) => (
                <div className={`leader ${i === 0 ? "first" : ""}`} key={name}>
                  <b>0{i + 1}</b>
                  <span className={`leader-avatar a${i}`}>{name[0]}</span>
                  <span>
                    <strong>{name}</strong>
                    <small>
                      {
                        [
                          "One Piece",
                          "Naruto",
                          "Crossverse",
                          "Jujutsu Kaisen",
                          "One Piece",
                        ][i]
                      }
                    </small>
                  </span>
                  <em>{[4820, 4655, 4510, 4398, 4211][i]}</em>
                </div>
              ),
            )}
            <button className="rank-me">
              <span>
                <b>842</b>
                <span>
                  <strong>CAPTAIN KAI</strong>
                  <small>Your global rank</small>
                </span>
              </span>
              <em>1,840</em>
            </button>
          </aside>
        </div>
      </div>
    </>
  );
}

function Leagues({ go }: { go: (s: Screen) => void }) {
  const arcs = ["East Blue", "Alabasta", "Skypiea", "Water 7", "Thriller Bark"];
  return (
    <>
      <Topbar title="One Piece · Grand Line" />
      <div className="content">
        <div className="world-banner">
          <div>
            <span className="eyebrow">WORLD 01 · ACTIVE DECK</span>
            <h2>THE GRAND LINE</h2>
            <p>
              Conquer every arc to unlock legendary fighters and exclusive Devil
              Fruit spells.
            </p>
          </div>
          <button className="fight-button" onClick={() => go("battle")}>
            CONTINUE JOURNEY <Icon name="arrow" />
          </button>
        </div>
        <div className="section-heading arc-heading">
          <div>
            <span className="eyebrow">STORY LEAGUES</span>
            <h2>Your voyage</h2>
          </div>
          <span className="rank-note">2 of 12 leagues unlocked</span>
        </div>
        <div className="league-list">
          {arcs.map((arc, i) => (
            <button
              className={`league-row ${i === 1 ? "current" : ""} ${i > 1 ? "lock" : ""}`}
              key={arc}
            >
              <span className="league-num">0{i + 1}</span>
              <span className={`league-emblem e${i}`}>{arc[0]}</span>
              <span>
                <small>
                  {i === 1 ? "CURRENT LEAGUE" : i > 1 ? "LOCKED" : "COMPLETED"}
                </small>
                <strong>{arc}</strong>
                <em>
                  {
                    [
                      "Romance Dawn · Arlong Park",
                      "Desert Rebellion · Rainbase",
                      "The White Sea",
                      "Enies Lobby · Aqua Laguna",
                      "Mysterious Island",
                    ][i]
                  }
                </em>
              </span>
              <span className="league-progress">
                <b>{i === 0 ? "12/12" : i === 1 ? "7/12" : "0/12"}</b>
                <i>
                  <em
                    style={{ width: i === 0 ? "100%" : i === 1 ? "58%" : "0%" }}
                  />
                </i>
              </span>
              <span className="league-reward">
                <small>ARC REWARD</small>
                <b>
                  {
                    [
                      "Nami SR",
                      "Crocodile SSR",
                      "Enel SSR",
                      "Robin SSR",
                      "Brook SR",
                    ][i]
                  }
                </b>
              </span>
              <Icon name="arrow" />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function Battle() {
  const [stance, setStance] = useState<"attack" | "defend">("attack");
  const [selected, setSelected] = useState(0);
  const [timer, setTimer] = useState(18);
  const [quiz, setQuiz] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [quizTime, setQuizTime] = useState(10);
  const [handOpen, setHandOpen] = useState(false);
  const [boost, setBoost] = useState<string | null>(null);
  useEffect(() => {
    const t = setInterval(() => setTimer((v) => (v > 0 ? v - 1 : 20)), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (!quiz || answered) return;
    const t = setInterval(() => setQuizTime((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [quiz, answered]);

  const openQuiz = () => {
    setAnswered(false);
    setQuizTime(10);
    setBoost(null);
    setQuiz(true);
  };

  return (
    <>
      <Topbar title="Ranked Battle · Alabasta" />
      <div className="battle-screen">
        <section className="combat-board">
          {quiz && (
            <section className="quiz-slide">
              <div className="quiz-race">
                <div className="race-player">
                  <span>K</span>
                  <i className={answered ? "done" : ""} />
                  <small>YOU</small>
                </div>
                <div className="race-timer">
                  <b>{quizTime}</b>
                  <small>SECONDS</small>
                </div>
                <div className="race-player opponent">
                  <i />
                  <span>C</span>
                  <small>RIVAL</small>
                </div>
              </div>
              {!answered && quizTime > 0 ? (
                <div className="slide-question">
                  <div>
                    <span className="eyebrow">
                      SPEED TRIAL · FIRST CORRECT ANSWER WINS
                    </span>
                    <strong>
                      What was the secret organization led by Crocodile?
                    </strong>
                  </div>
                  <div className="slide-answers">
                    {["Baroque Works", "Cipher Pol", "Germa 66"].map((a, i) => (
                      <button
                        onClick={() => i === 0 && setAnswered(true)}
                        key={a}
                      >
                        <b>{String.fromCharCode(65 + i)}</b>
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              ) : answered ? (
                <div className="boost-pick">
                  <div>
                    <span className="win-flash">YOU ANSWERED FIRST</span>
                    <strong>CHOOSE YOUR EARNED POWER-UP</strong>
                  </div>
                  {[
                    ["RAGE", "+20% ATK", "flame"],
                    ["OBSERVATION", "Reveal stance", "bolt"],
                    ["IRON GUARD", "50% shield", "shield"],
                  ].map(([name, effect, icon]) => (
                    <button
                      className={boost === name ? "picked" : ""}
                      onClick={() => setBoost(name)}
                      key={name}
                    >
                      <Icon name={icon} />
                      <span>
                        <strong>{name}</strong>
                        <small>{effect}</small>
                      </span>
                    </button>
                  ))}
                  <button
                    className="claim-boost"
                    disabled={!boost}
                    onClick={() => setQuiz(false)}
                  >
                    {boost ? "ACTIVATE" : "SELECT POWER"}
                  </button>
                </div>
              ) : (
                <div className="quiz-expired">
                  <strong>TIME EXPIRED</strong>
                  <span>Your rival claimed the power-up.</span>
                  <button onClick={() => setQuiz(false)}>
                    RETURN TO BATTLE
                  </button>
                </div>
              )}
            </section>
          )}
          <div className="combat-top">
            <div className="player enemy-player">
              <span className="combat-avatar">C</span>
              <span>
                <small>DESERT KING</small>
                <strong>Sir Croc</strong>
              </span>
              <div className="hp">
                <i style={{ width: "68%" }} />
                <b>6,820 / 10,000</b>
              </div>
            </div>
            <div className="round-display">
              <small>BEST OF 3</small>
              <strong>ROUND 2</strong>
              <span>
                <i className="win" />
                <i className="loss" />
                <i />
              </span>
            </div>
            <div className="player">
              <div className="hp">
                <i style={{ width: "82%" }} />
                <b>8,240 / 10,000</b>
              </div>
              <span>
                <small>GOLD III</small>
                <strong>Captain Kai</strong>
              </span>
              <span className="combat-avatar">K</span>
            </div>
          </div>
          <div className="battlefield">
            <div className="active-fighter enemy-active">
              <div className="fighter-portrait croc-fighter">
                <span>C</span>
              </div>
              <div>
                <small>ENEMY ACTIVE</small>
                <strong>SIR CROCODILE</strong>
                <span>ATK 2,610 · CONTROL</span>
              </div>
            </div>
            <div className="action-center">
              <span>OPPONENT</span>
              <strong>IS CHOOSING</strong>
              <i />
              <b>{timer}</b>
            </div>
            <div className="active-fighter">
              <div>
                <small>YOUR ACTIVE</small>
                <strong>{cards[selected].name}</strong>
                <span>
                  ATK {cards[selected].power} · {cards[selected].type}
                </span>
              </div>
              <div
                className={`fighter-portrait hero-fighter ${cards[selected].color}`}
              >
                <span>{cards[selected].name[0]}</span>
              </div>
            </div>
          </div>
          <div className="strategy-bar">
            <span className="strategy-label">
              CHOOSE YOUR STANCE <small>Stances resolve simultaneously</small>
            </span>
            <button
              className={stance === "attack" ? "chosen attack-choice" : ""}
              onClick={() => setStance("attack")}
            >
              <Icon name="sword" />
              <span>
                <strong>ATTACK</strong>
                <small>Deal full power · −10% DEF</small>
              </span>
            </button>
            <button
              className={stance === "defend" ? "chosen defend-choice" : ""}
              onClick={() => setStance("defend")}
            >
              <Icon name="shield" />
              <span>
                <strong>DEFEND</strong>
                <small>Block 50% · Gain 1 energy</small>
              </span>
            </button>
            <button className="commit-button">
              LOCK MOVE <b>{timer}s</b>
            </button>
          </div>
        </section>

        <section className={`hand-area ${handOpen ? "hand-open" : ""}`}>
          <div className="hand-title">
            <div>
              <span className="eyebrow">YOUR HAND</span>
              <h2>
                {handOpen
                  ? "Select a fighter card"
                  : "Tap the deck to view your hand"}
              </h2>
            </div>
            <div className="energy-pips">
              <span>ENERGY</span>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <i className={n < 6 ? "full" : ""} key={n} />
              ))}
              <b>5/6</b>
            </div>
            <button className="quiz-trigger" onClick={openQuiz}>
              SPEED QUIZ <span>POWER-UP READY</span>
            </button>
          </div>
          <div
            className={`battle-hand ${handOpen ? "expanded" : "stacked"}`}
            onClick={() => !handOpen && setHandOpen(true)}
          >
            {cards.map((card, i) => (
              <GameCard
                key={card.name}
                card={card}
                index={i}
                selected={selected === i}
                onClick={() => {
                  setSelected(i);
                  setHandOpen(true);
                }}
              />
            ))}
            <button className="spell-card">
              <span className="spell-cost">2</span>
              <div className="spell-mark">
                <Icon name="flame" size={30} />
              </div>
              <small>DEVIL FRUIT SPELL</small>
              <strong>DESERT TEMPO</strong>
              <p>Reduce enemy accuracy by 20% this round.</p>
              <span>QUICK PLAY</span>
            </button>
          </div>
          {handOpen && (
            <button
              className="collapse-hand"
              onClick={() => setHandOpen(false)}
            >
              STACK DECK
            </button>
          )}
        </section>
      </div>
    </>
  );
}

const collectionCards = [
  {
    name: "Monkey D. Luffy",
    form: "Gear Second",
    grade: "S",
    stars: 5,
    level: 38,
    power: 2480,
    atk: 92,
    def: 74,
    spd: 96,
    color: "crimson",
    powers: ["Jet Gatling", "Captain’s Will", "Overdrive"],
  },
  {
    name: "Roronoa Zoro",
    form: "Three Sword Style",
    grade: "A",
    stars: 4,
    level: 35,
    power: 2320,
    atk: 94,
    def: 81,
    spd: 76,
    color: "emerald",
    powers: ["Lion Song", "Guard Break"],
  },
  {
    name: "Nico Robin",
    form: "Cien Fleur",
    grade: "A",
    stars: 4,
    level: 33,
    power: 2050,
    atk: 78,
    def: 72,
    spd: 84,
    color: "amethyst",
    powers: ["Clutch", "Enemy Reveal"],
  },
  {
    name: "Sanji",
    form: "Diable Jambe",
    grade: "B",
    stars: 3,
    level: 31,
    power: 2180,
    atk: 88,
    def: 68,
    spd: 91,
    color: "azure",
    powers: ["Flambage Shot"],
  },
];

function Stars({
  count,
  compact = false,
}: {
  count: number;
  compact?: boolean;
}) {
  return (
    <span className={`stars ${compact ? "compact" : ""}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <i className={n <= count ? "on" : ""} key={n}>
          ★
        </i>
      ))}
    </span>
  );
}

function CardPortrait({ color, letter }: { color: string; letter: string }) {
  return (
    <div className={`premium-portrait ${color}`}>
      <div className="portrait-rays" />
      <div className="anime-head">
        <i />
        <b />
      </div>
      <div className="anime-body">
        <i />
        <i />
      </div>
      <strong>{letter}</strong>
    </div>
  );
}

function Collection() {
  const [active, setActive] = useState(0);
  const card = collectionCards[active];
  return (
    <>
      <Topbar title="Fighter Collection" />
      <div className="content collection-page">
        <div className="collection-heading">
          <div>
            <span className="eyebrow">ONE PIECE DECK · 28 / 120</span>
            <h2>BUILD YOUR DREAM CREW</h2>
            <p>
              Level up fighters, unlock stars, and combine powers to create your
              strongest battle deck.
            </p>
          </div>
          <div className="collection-score">
            <small>DECK POWER</small>
            <strong>9,030</strong>
            <span>TOP 14%</span>
          </div>
        </div>
        <div className="collection-layout">
          <section className="featured-card-zone">
            <div className={`hero-card ${card.color}`}>
              <div className="hero-card-inner">
                <div className="hero-card-top">
                  <span className="hero-grade">{card.grade}</span>
                  <div>
                    <small>CHARACTER CARD</small>
                    <Stars count={card.stars} />
                  </div>
                  <span className="hero-cost">
                    <Icon name="bolt" size={13} />
                    {Math.max(2, card.stars - 1)}
                  </span>
                </div>
                <CardPortrait color={card.color} letter={card.name[0]} />
                <div className="hero-card-name">
                  <small>{card.form}</small>
                  <strong>{card.name}</strong>
                  <span>SR · OP-001</span>
                </div>
                <div className="hero-card-rating">
                  <small>OVERALL</small>
                  <strong>{card.power}</strong>
                  <span>
                    ATK {card.atk} · DEF {card.def}
                  </span>
                </div>
                <div className="hero-bottom-stars">
                  <Stars count={card.stars} />
                  <b>LV. {card.level}</b>
                </div>
                <div className="foil-line" />
              </div>
            </div>
            <div className="card-actions">
              <button>SET AS CAPTAIN</button>
              <button>
                LEVEL UP <span>12,500</span>
              </button>
            </div>
          </section>

          <section className="card-details">
            <div className="detail-title">
              <div>
                <span className="eyebrow">SELECTED FIGHTER</span>
                <h2>{card.name}</h2>
                <p>{card.form} · Striker class</p>
              </div>
              <span
                className={`rank-badge ${card.grade === "S" ? "s-rank" : ""}`}
              >
                <small>RANK</small>
                {card.grade}
              </span>
            </div>
            <div className="stat-trio">
              {[
                ["ATK", card.atk],
                ["DEF", card.def],
                ["SPD", card.spd],
              ].map(([label, value]) => (
                <div key={label}>
                  <span>
                    <small>{label}</small>
                    <b>{value}</b>
                  </span>
                  <i>
                    <em style={{ width: `${value}%` }} />
                  </i>
                </div>
              ))}
            </div>
            <div className="power-heading">
              <span>SPECIAL POWERS</span>
              <small>{card.powers.length} / 3 unlocked</small>
            </div>
            <div className="power-list">
              {card.powers.map((power, i) => (
                <article key={power} className={i === 0 ? "signature" : ""}>
                  <span className="power-icon">
                    {i === 0 ? (
                      <Icon name="flame" />
                    ) : i === 1 ? (
                      <Icon name="shield" />
                    ) : (
                      <Icon name="bolt" />
                    )}
                  </span>
                  <div>
                    <small>
                      {i === 0 ? "SIGNATURE MOVE" : "PASSIVE POWER"}
                    </small>
                    <strong>{power}</strong>
                    <p>
                      {i === 0
                        ? `Deal ${125 + card.stars * 5}% ATK damage. Gains +8% power for every crew card played.`
                        : i === 1
                          ? "Boost team resistance by 12% when health falls below half."
                          : "Once per match, immediately take another action after attacking."}
                    </p>
                  </div>
                  <b>LV.{Math.max(1, 5 - i)}</b>
                </article>
              ))}
              {card.powers.length < 3 && (
                <article className="locked-power">
                  <span className="power-icon">×</span>
                  <div>
                    <small>LOCKED POWER</small>
                    <strong>{card.stars + 1}★ EVOLUTION REQUIRED</strong>
                    <p>
                      Increase this card’s star rating to reveal its final
                      ability.
                    </p>
                  </div>
                </article>
              )}
            </div>
            <div className="synergy">
              <span>CREW SYNERGY</span>
              <div>
                <i>L</i>
                <i>Z</i>
                <i>N</i>
              </div>
              <p>
                <b>Straw Hat Bond</b> · +9% ATK with 3 crew members
              </p>
            </div>
          </section>

          <aside className="collection-list">
            <div className="collection-tools">
              <div>
                <span className="eyebrow">YOUR CARDS</span>
                <h3>Fighters</h3>
              </div>
              <button>FILTER</button>
            </div>
            <div className="small-card-grid">
              {collectionCards.map((item, i) => (
                <button
                  className={`roster-card ${item.color} ${active === i ? "active" : ""}`}
                  onClick={() => setActive(i)}
                  key={item.name}
                >
                  <div className="roster-grade">{item.grade}</div>
                  <CardPortrait color={item.color} letter={item.name[0]} />
                  <div className="roster-copy">
                    <Stars count={item.stars} compact />
                    <strong>{item.name}</strong>
                    <small>{item.form}</small>
                    <span>
                      <b>{item.power}</b> PWR · LV {item.level}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </aside>
        </div>
        <section className="rarity-guide">
          <span>POWER TIERS</span>
          <div>
            <b className="s">S</b>
            <p>
              <strong>ELITE</strong>3 special powers · 5 stars
            </p>
          </div>
          <div>
            <b className="a">A</b>
            <p>
              <strong>RARE</strong>2 special powers · 4 stars
            </p>
          </div>
          <div>
            <b className="b">B</b>
            <p>
              <strong>CORE</strong>1 special power · 1–3 stars
            </p>
          </div>
        </section>
      </div>
    </>
  );
}

function CardCanvas() {
  const samples = [
    {
      name: "Monkey D. Luffy",
      form: "Gear Second",
      tier: "S" as const,
      stars: 5,
      attack: 2480,
      defense: 1785,
      level: 38,
      power: "Jet Gatling",
      accent: "sunset" as const,
    },
    {
      name: "Roronoa Zoro",
      form: "Three Sword Style",
      tier: "A" as const,
      stars: 4,
      attack: 2320,
      defense: 1870,
      level: 35,
      power: "Lion Song",
      accent: "forest" as const,
    },
    {
      name: "Nico Robin",
      form: "Cien Fleur",
      tier: "B" as const,
      stars: 3,
      attack: 2050,
      defense: 1540,
      level: 33,
      power: "Clutch",
      accent: "shadow" as const,
    },
    {
      name: "Usopp",
      form: "Sniper King",
      tier: "C" as const,
      stars: 2,
      attack: 1480,
      defense: 1120,
      level: 22,
      power: "Firebird Star",
      accent: "ocean" as const,
    },
  ];
  return (
    <>
      <Topbar title="Reusable Card Canvas" />
      <div className="content card-canvas">
        <div className="canvas-intro">
          <div>
            <span className="eyebrow">DESIGN SYSTEM · CARD TIERS</span>
            <h2>FIGHTER CARD CANVAS</h2>
            <p>
              A reusable card set with clear visual degradation between elite
              and entry-level tiers.
            </p>
          </div>
          <code>
            src/components/AnimeCard.tsx
            <br />
            src/cards.css
          </code>
        </div>
        <section className="tier-showcase">
          {samples.map((card) => (
            <div className="tier-sample" key={card.tier}>
              <div className="tier-caption">
                <span>TIER {card.tier}</span>
                <b>
                  {card.tier === "S"
                    ? "ELITE / VIVID"
                    : card.tier === "A"
                      ? "RARE / RICH"
                      : card.tier === "B"
                        ? "CORE / MUTED"
                        : "ROOKIE / DULL"}
                </b>
              </div>
              <AnimeCard {...card} />
              <p>
                {card.tier === "S"
                  ? "Maximum saturation, foil shine, five stars and three powers."
                  : card.tier === "A"
                    ? "Slightly muted with strong rarity color and two powers."
                    : card.tier === "B"
                      ? "Reduced saturation, no foil and one special power."
                      : "Mostly monochrome, flat lighting and basic ability only."}
              </p>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  return (
    <main>
      <Nav screen={screen} go={setScreen} />
      <section className="shell">
        {screen === "home" ? (
          <Home go={setScreen} />
        ) : screen === "leagues" ? (
          <Leagues go={setScreen} />
        ) : screen === "collection" ? (
          <Collection />
        ) : screen === "cardlab" ? (
          <CardCanvas />
        ) : (
          <Battle />
        )}
      </section>
    </main>
  );
}
