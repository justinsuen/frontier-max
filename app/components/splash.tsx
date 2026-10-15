// The logo intro shown once per visit (browser session). It's plain HTML and CSS so
// it's on screen from the very first paint; SPLASH_CHECK in <head> hides it before
// paint when it has already played this session, when the device asks for reduced
// motion, or when session storage isn't available.

const STORAGE_KEY = "fm-splash";

export const SPLASH_CHECK = `try{var d=document.documentElement;if(matchMedia("(prefers-reduced-motion: reduce)").matches||sessionStorage.getItem("${STORAGE_KEY}")){d.classList.add("splash-seen")}else{sessionStorage.setItem("${STORAGE_KEY}","1")}}catch(e){document.documentElement.classList.add("splash-seen")}`;

// Click or any key skips it; it also removes itself once it has faded out.
const SPLASH_SKIP = `(function(){var s=document.getElementById("splash");if(!s)return;function done(){s.classList.add("is-done");removeEventListener("keydown",done)}s.addEventListener("click",done);addEventListener("keydown",done);s.addEventListener("animationend",function(e){if(e.target===s)done()})})()`;

const WORD = "FRONTIER";
const ACCENT = "MAX";

export default function Splash() {
  let i = 0;
  const letters = (text: string, className?: string) =>
    [...text].map((ch) => (
      <span key={i} className={`splash-letter${className ? ` ${className}` : ""}`} style={{ "--i": i++ } as React.CSSProperties}>
        {ch}
      </span>
    ));

  return (
    <>
      <div id="splash" className="splash" aria-hidden="true" suppressHydrationWarning>
        <div className="splash-mark">
          <span className="splash-word">
            {letters(WORD)}
            <span className="splash-gap" />
            {letters(ACCENT, "is-accent")}
          </span>
          <span className="splash-bar" />
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: SPLASH_SKIP }} />
    </>
  );
}
