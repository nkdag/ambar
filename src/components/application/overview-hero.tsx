"use client";

import { RiArrowRightLine, RiArchive2Line } from "@remixicon/react";
import { Button } from "@/components/base/buttons/button";
import { Spotlight } from "@/components/base/spotlight/spotlight";

export function OverviewHero({ onBrowse }: { onBrowse: () => void }) {
  return <section className="overview-hero visual-surface" aria-labelledby="overview-title">
    <div className="hero-atmosphere" aria-hidden="true" />
    <Spotlight />
    <div className="hero-copy">
      <p className="hero-location">Control Room <span>/</span> Overview</p>
      <h1 id="overview-title">Your library,<br /> in view.</h1>
      <p className="hero-description">A little less searching.<br className="hero-mobile-break" /> A little more finding.</p>
      <Button variant="secondary" trailingIcon={RiArrowRightLine} onClick={onBrowse}>Browse library</Button>
    </div>
    <div className="hero-art" data-hero-art aria-hidden="true">
      <div className="hero-contours" />
      <div className="archive-leaf leaf-back" />
      <div className="archive-leaf leaf-middle" />
      <div className="archive-leaf leaf-front"><span className="leaf-rule" /><RiArchive2Line /><span className="leaf-wordmark">AMBAR</span><span className="leaf-rule" /></div>
      <div className="hero-art-caption">Room for what matters.</div>
    </div>
  </section>;
}
