import "./cards.css";

export type AnimeCardTier = "S" | "A" | "B" | "C";

export type AnimeCardProps = {
  name: string;
  form: string;
  tier: AnimeCardTier;
  stars: number;
  attack: number;
  defense: number;
  level: number;
  power: string;
  accent?: "sunset" | "forest" | "ocean" | "shadow";
};

export default function AnimeCard({
  name,
  form,
  tier,
  stars,
  attack,
  defense,
  level,
  power,
  accent = "sunset",
}: AnimeCardProps) {
  return (
    <article
      className={`anime-card tier-${tier.toLowerCase()} accent-${accent}`}
    >
      <div className="anime-card__foil" />
      <header className="anime-card__header">
        <span className="anime-card__tier">{tier}</span>
        <span>
          <small>FIGHTER CARD</small>
          <strong>{name}</strong>
        </span>
        <b>{level}</b>
      </header>
      <div className="anime-card__art">
        <div className="anime-card__burst" />
        <div className="anime-card__character">
          <i />
          <i />
          <i />
        </div>
        <span className="anime-card__edition">VC · 001</span>
        <strong className="anime-card__class">
          {tier === "S"
            ? "LEGEND"
            : tier === "A"
              ? "ALL-STAR"
              : tier === "B"
                ? "RARE"
                : "ROOKIE"}
        </strong>
      </div>
      <div className="anime-card__identity">
        <small>{form}</small>
        <strong>{name}</strong>
      </div>
      <div className="anime-card__power">
        <small>SPECIAL POWER</small>
        <strong>{power}</strong>
        <p>
          {tier === "S"
            ? "Signature move plus two passive abilities."
            : tier === "A"
              ? "Signature move plus one passive ability."
              : tier === "B"
                ? "One special move with standard effect."
                : "Basic move. Evolve to unlock a special power."}
        </p>
      </div>
      <div className="anime-card__stats">
        <span>
          ATK <b>{attack}</b>
        </span>
        <span>
          DEF <b>{defense}</b>
        </span>
      </div>
      <footer className="anime-card__footer">
        <span>
          {[1, 2, 3, 4, 5].map((n) => (
            <i className={n <= stars ? "is-on" : ""} key={n}>
              ★
            </i>
          ))}
        </span>
        <b>LV {level}</b>
      </footer>
    </article>
  );
}
