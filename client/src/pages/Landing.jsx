import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styled, { css, keyframes } from "styled-components";
import { Check } from "lucide-react";
import { isLoggedIn } from "../utils/auth";
import MeetwiseLogo from "../components/MeetwiseLogo";

const TRANSCRIPT = [
  { speaker: "Sara", text: "Let's ship the beta on Friday." },
  { speaker: "Omar", text: "I'll fix the login bug before then." },
  {
    speaker: "Sara",
    text: "Pricing stays as it is. We'll revisit it next quarter.",
  },
  {
    speaker: "Ali",
    text: "I'll send the release notes to the team by Thursday.",
  },
];

const SPEAKER_COLORS = {
  Sara: "#1683d8",
  Omar: "#0e9f6e",
  Ali: "#b7791f",
};

const ANALYSIS = {
  summary:
    "The team will ship the beta on Friday, once the login bug is fixed. Pricing stays the same until next quarter.",
  actionItems: [
    { task: "Fix the login bug", owner: "Omar", deadline: "Before Friday" },
    {
      task: "Send the release notes to the team",
      owner: "Ali",
      deadline: "Thursday",
    },
  ],
  decisions: [
    "Ship the beta on Friday",
    "Keep pricing as it is until next quarter",
  ],
};

const STEPS = [
  {
    title: "Add your meeting",
    text: "Enter a title and date, then paste the transcript.",
  },
  {
    title: "Analyze it",
    text: "Meetwise reads the transcript and pulls out the summary, action items and decisions.",
  },
  {
    title: "Follow through",
    text: "Tick off action items as they get done. Your dashboard shows what is still pending.",
  },
];

const FACTS = [
  {
    title: "Summary",
    text: "The main points of the meeting in a few sentences, so nobody has to reread the transcript.",
  },
  {
    title: "Action items",
    text: "Each task with its owner and deadline, whenever the transcript mentions them.",
  },
  {
    title: "Decisions",
    text: "What was agreed, listed separately from the discussion that led to it.",
  },
  {
    title: "Your own workspace",
    text: "You sign in, and only you can see your meetings.",
  },
];

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Landing() {
  const loggedIn = isLoggedIn();
  const tiltRef = useRef(null);

  // With reduced motion, the demo starts in its finished state.
  const [instant] = useState(prefersReducedMotion);
  const [visibleLines, setVisibleLines] = useState(
    instant ? TRANSCRIPT.length : 0
  );
  const [phase, setPhase] = useState(instant ? "done" : "waiting");
  const [checked, setChecked] = useState([false, false]);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    if (instant) return undefined;

    const timers = [];
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));

    TRANSCRIPT.forEach((_, i) => {
      at(700 + i * 850, () => setVisibleLines(i + 1));
    });

    const typedAt = 700 + TRANSCRIPT.length * 850;
    at(typedAt, () => setPhase("analyzing"));
    at(typedAt + 1500, () => setPhase("done"));

    return () => timers.forEach(clearTimeout);
  }, [runId, instant]);

  const replay = () => {
    setChecked([false, false]);
    setVisibleLines(0);
    setPhase("waiting");
    setRunId((id) => id + 1);
  };

  const toggleItem = (index) => {
    setChecked((current) =>
      current.map((value, i) => (i === index ? !value : value))
    );
  };

  const doneCount = checked.filter(Boolean).length;


  const handlePointerMove = (e) => {
    const el = tiltRef.current;
    if (!el || prefersReducedMotion()) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    el.style.setProperty("--ry", `${-10 + x * 22}deg`);
    el.style.setProperty("--rx", `${6 - y * 16}deg`);
  };

  const resetTilt = () => {
    const el = tiltRef.current;
    if (!el) return;

    el.style.removeProperty("--ry");
    el.style.removeProperty("--rx");
  };

  return (
    <Page>
      <Glow aria-hidden="true" />

      <Wrap>
        <TopBar>
          <Brand to="/">
            <BrandMark><MeetwiseLogo size={27} /></BrandMark>
            <BrandName>Meetwise</BrandName>
          </Brand>

          <NavLinks>
            <NavAnchor href="#how-it-works">How it works</NavAnchor>
            <NavAnchor href="#what-you-get">What you get</NavAnchor>
          </NavLinks>

          <NavActions>
            {loggedIn ? (
              <PrimaryLink to="/dashboard" $compact>
                Open dashboard
              </PrimaryLink>
            ) : (
              <>
                <TextLink to="/login">Log in</TextLink>
                <PrimaryLink to="/register" $compact>
                  Create account
                </PrimaryLink>
              </>
            )}
          </NavActions>
        </TopBar>

        <Hero>
          <HeroText>
            <Headline>Turn meetings into clear actions and decisions.</Headline>

            <HeroSub>
              Paste a transcript. Meetwise returns a summary, the action
              items with who owns them, and the decisions that were made.
            </HeroSub>

            <HeroActions>
              {loggedIn ? (
                <PrimaryLink to="/dashboard">Open dashboard</PrimaryLink>
              ) : (
                <>
                  <PrimaryLink to="/register">Create account</PrimaryLink>
                  <SecondaryLink to="/login">Log in</SecondaryLink>
                </>
              )}
            </HeroActions>

            {!loggedIn && (
              <HeroNote>Your meetings stay private to your account.</HeroNote>
            )}
          </HeroText>

          <Stage onPointerMove={handlePointerMove} onPointerLeave={resetTilt}>
            <Demo
              role="group"
              aria-label="Example: a meeting transcript turned into a summary, action items and decisions"
            >
              <Tilt ref={tiltRef}>
                <Sheet>
                  <SheetHeader>
                    <SheetTitle>Product sync</SheetTitle>
                    <SheetMeta>Transcript</SheetMeta>
                  </SheetHeader>

                  <Lines>
                    {TRANSCRIPT.map((line, i) => (
                      <Line key={i} $visible={i < visibleLines}>
                        <Speaker style={{ color: SPEAKER_COLORS[line.speaker] }}>
                          {line.speaker}
                        </Speaker>
                        <LineText>{line.text}</LineText>
                      </Line>
                    ))}
                  </Lines>
                </Sheet>

                <Analysis>
                  <AnalysisHeader>
                    <AnalysisTitle>Analysis</AnalysisTitle>
                    <StatusPill $phase={phase}>
                      {phase === "done"
                        ? "Ready"
                        : phase === "analyzing"
                        ? "Analyzing..."
                        : "Waiting for transcript"}
                    </StatusPill>
                  </AnalysisHeader>

                  {phase === "done" ? (
                    <Results key={runId}>
                      <Block style={{ "--i": 0 }}>
                        <BlockTitle>Summary</BlockTitle>
                        <SummaryText>{ANALYSIS.summary}</SummaryText>
                      </Block>

                      <Block style={{ "--i": 1 }}>
                        <BlockTitle>
                          Action items
                          <BlockCount>
                            {doneCount} of {ANALYSIS.actionItems.length} done
                          </BlockCount>
                        </BlockTitle>

                        {ANALYSIS.actionItems.map((item, i) => (
                          <ItemButton
                            key={item.task}
                            type="button"
                            aria-pressed={checked[i]}
                            onClick={() => toggleItem(i)}
                          >
                            <CheckBox $checked={checked[i]}>
                              {checked[i] && <Check size={12} strokeWidth={3} />}
                            </CheckBox>

                            <ItemBody>
                              <ItemTask $checked={checked[i]}>{item.task}</ItemTask>
                              <ItemChips>
                                <Chip>{item.owner}</Chip>
                                <Chip>{item.deadline}</Chip>
                              </ItemChips>
                            </ItemBody>
                          </ItemButton>
                        ))}
                      </Block>

                      <Block style={{ "--i": 2 }}>
                        <BlockTitle>Decisions</BlockTitle>
                        <DecisionList>
                          {ANALYSIS.decisions.map((decision) => (
                            <Decision key={decision}>{decision}</Decision>
                          ))}
                        </DecisionList>
                      </Block>
                    </Results>
                  ) : (
                    <Skeleton aria-hidden="true" $active={phase === "analyzing"}>
                      <SkeletonBar style={{ width: "34%" }} />
                      <SkeletonBar style={{ width: "100%" }} />
                      <SkeletonBar style={{ width: "92%" }} />
                      <SkeletonBar style={{ width: "58%" }} />
                      <SkeletonBar style={{ width: "40%", marginTop: 22 }} />
                      <SkeletonBar style={{ width: "88%" }} />
                      <SkeletonBar style={{ width: "76%" }} />
                    </Skeleton>
                  )}
                </Analysis>
              </Tilt>
            </Demo>

            <ReplayRow>
              <ReplayButton
                type="button"
                onClick={replay}
                $hidden={phase !== "done" || instant}
                tabIndex={phase !== "done" || instant ? -1 : 0}
              >
                Replay example
              </ReplayButton>
            </ReplayRow>
          </Stage>
        </Hero>

        <Section id="how-it-works">
          <SectionTitle>How it works</SectionTitle>

          <Steps>
            {STEPS.map((step, i) => (
              <Step key={step.title}>
                <StepNumber>{i + 1}</StepNumber>
                <StepTitle>{step.title}</StepTitle>
                <StepText>{step.text}</StepText>
              </Step>
            ))}
          </Steps>
        </Section>

        <Section id="what-you-get">
          <SectionTitle>What each analysis includes</SectionTitle>

          <Facts>
            {FACTS.map((fact) => (
              <Fact key={fact.title}>
                <FactTitle>{fact.title}</FactTitle>
                <FactText>{fact.text}</FactText>
              </Fact>
            ))}
          </Facts>
        </Section>

        <Closing>
          <ClosingTitle>Try it on your next meeting.</ClosingTitle>

          <HeroActions>
            {loggedIn ? (
              <PrimaryLink to="/dashboard">Open dashboard</PrimaryLink>
            ) : (
              <>
                <PrimaryLink to="/register">Create account</PrimaryLink>
                <SecondaryLink to="/login">Log in</SecondaryLink>
              </>
            )}
          </HeroActions>
        </Closing>

        <Footer>
          <FooterBrand>Meetwise</FooterBrand>
          {!loggedIn && <FooterLink to="/login">Log in</FooterLink>}
        </Footer>
      </Wrap>
    </Page>
  );
}

export default Landing;


const rise = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
`;


const NAVY = "#0b1220";
const MUTED = "#9aa7b8";
const BLUE = "#1683d8";
const LIGHT_BLUE = "#6cc3ff";

const Page = styled.div`
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  background: ${NAVY};
  color: #ffffff;
`;

const Glow = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 900px;
  pointer-events: none;
  background: radial-gradient(
    ellipse 700px 520px at 74% 320px,
    rgba(40, 140, 255, 0.26),
    transparent 70%
  );

  @media (max-width: 980px) {
    background: radial-gradient(
      ellipse 600px 480px at 50% 640px,
      rgba(40, 140, 255, 0.24),
      transparent 70%
    );
  }
`;

const Wrap = styled.div`
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;

  @media (max-width: 520px) {
    padding: 0 20px;
  }
`;

const TopBar = styled.header`
  display: flex;
  align-items: center;
  gap: 32px;
  height: 76px;

  @media (max-width: 520px) {
    gap: 12px;
  }
`;

const Brand = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  color: inherit;
  text-decoration: none;
`;

const BrandMark = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: ${BLUE};
  font-size: 15px;
  font-weight: 800;
`;

const BrandName = styled.span`
  font-size: 16px;
  font-weight: 700;
`;

const NavLinks = styled.nav`
  display: flex;
  gap: 26px;
  margin-left: 12px;

  @media (max-width: 760px) {
    display: none;
  }
`;

const NavAnchor = styled.a`
  font-size: 14px;
  color: ${MUTED};
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: #ffffff;
  }

  &:focus-visible {
    outline: 2px solid ${LIGHT_BLUE};
    outline-offset: 4px;
    border-radius: 4px;
  }
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  margin-left: auto;

  @media (max-width: 520px) {
    gap: 12px;
  }
`;

const TextLink = styled(Link)`
  font-size: 14px;
  font-weight: 600;
  color: #dbe5f1;
  text-decoration: none;

  &:hover {
    color: #ffffff;
  }

  &:focus-visible {
    outline: 2px solid ${LIGHT_BLUE};
    outline-offset: 4px;
    border-radius: 4px;
  }
`;

const PrimaryLink = styled(Link)`
  display: inline-flex;
  white-space: nowrap;
  align-items: center;
  justify-content: center;
  padding: ${({ $compact }) => ($compact ? "9px 16px" : "14px 24px")};
  border-radius: 10px;
  background: linear-gradient(110deg, #1683d8, #3fa4f0 50%, #1683d8);
  background-size: 200% 100%;
  color: #ffffff;
  font-size: ${({ $compact }) => ($compact ? "13px" : "15px")};
  font-weight: 700;
  text-decoration: none;
  transition:
    transform 0.2s ease,
    box-shadow 0.3s ease,
    background-position 0.6s ease;

  &:hover {
    transform: translateY(-2px);
    background-position: 100% 0;
    box-shadow: 0 8px 25px rgba(22, 131, 216, 0.4);
  }

  &:focus-visible {
    outline: 2px solid ${LIGHT_BLUE};
    outline-offset: 3px;
  }
`;

const SecondaryLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 13px 24px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 10px;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.07);
  }

  &:focus-visible {
    outline: 2px solid ${LIGHT_BLUE};
    outline-offset: 3px;
  }
`;


const Hero = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  gap: 40px;
  align-items: center;
  padding: 56px 0 88px;

  @media (max-width: 980px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 48px;
    padding: 40px 0 72px;
  }
`;

const HeroText = styled.div`
  max-width: 540px;
`;

const Headline = styled.h1`
  font-size: clamp(2.3rem, 4.6vw, 3.6rem);
  font-weight: 800;
  line-height: 1.06;
  letter-spacing: -0.025em;
  text-wrap: balance;
`;

const HeroSub = styled.p`
  margin-top: 22px;
  max-width: 460px;
  font-size: 17px;
  line-height: 1.6;
  color: ${MUTED};
`;

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 32px;
`;

const HeroNote = styled.p`
  margin-top: 18px;
  font-size: 13px;
  color: #6b7788;
`;


const Stage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Demo = styled.div`
  --s: 1;
  position: relative;
  width: 600px;
  height: 540px;
  perspective: 1400px;
  transform: scale(var(--s));
  transform-origin: 50% 0;
  margin-bottom: calc(540px * (var(--s) - 1));

  @media (max-width: 1240px) {
    --s: 0.9;
  }

  @media (max-width: 1100px) {
    --s: 0.8;
  }

  @media (max-width: 1000px) and (min-width: 981px) {
    --s: 0.75;
  }

  @media (max-width: 980px) {
    --s: 1;
  }

  @media (max-width: 700px) {
    --s: 0.9;
  }

  @media (max-width: 620px) {
    --s: 1;
    width: 100%;
    height: auto;
    perspective: none;
    transform: none;
    margin-bottom: 0;
  }
`;

const Tilt = styled.div`
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  transform: rotateX(var(--rx, 6deg)) rotateY(var(--ry, -10deg));
  transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  @media (max-width: 620px) {
    position: static;
    display: flex;
    flex-direction: column;
    gap: 16px;
    transform: none;
  }
`;

const Sheet = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 256px;
  padding: 20px 20px 24px;
  border-radius: 14px;
  background: #f4f7fb;
  color: #0f1a2e;
  transform: translateZ(0) rotate(-2.2deg);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.45);

  @media (max-width: 620px) {
    position: static;
    width: 100%;
    transform: none;
  }
`;

const SheetHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-bottom: 14px;
  border-bottom: 1px solid #dde4ee;
`;

const SheetTitle = styled.p`
  font-size: 15px;
  font-weight: 800;
`;

const SheetMeta = styled.p`
  font-size: 12px;
  color: #6a7a90;
`;

const Lines = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 16px;
`;

const Line = styled.div`
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: translateY(${({ $visible }) => ($visible ? "0" : "6px")});
  transition:
    opacity 0.4s ease,
    transform 0.4s ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Speaker = styled.p`
  font-size: 12.5px;
  font-weight: 800;
`;

const LineText = styled.p`
  margin-top: 2px;
  font-size: 14px;
  line-height: 1.45;
  color: #2b3a52;
`;

const Analysis = styled.div`
  position: absolute;
  top: 118px;
  right: 0;
  width: 340px;
  min-height: 412px;
  padding: 22px;
  border-radius: 16px;
  background: #ffffff;
  color: #0f1a2e;
  transform: translateZ(80px);
  box-shadow:
    0 40px 80px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(15, 26, 46, 0.06);

  @media (max-width: 620px) {
    position: static;
    width: 100%;
    min-height: 0;
    transform: none;
  }
`;

const AnalysisHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const AnalysisTitle = styled.p`
  font-size: 16px;
  font-weight: 800;
`;

const pillColors = {
  waiting: { bg: "#eef2f7", fg: "#5b6b80" },
  analyzing: { bg: "#e6f2fd", fg: "#1270b8" },
  done: { bg: "#e1f6ec", fg: "#0b7d54" },
};

const StatusPill = styled.span`
  padding: 5px 11px;
  border-radius: 999px;
  background: ${({ $phase }) => pillColors[$phase].bg};
  color: ${({ $phase }) => pillColors[$phase].fg};
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
`;

const Results = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 18px;
`;

const Block = styled.div`
  animation: ${rise} 0.5s ease both;
  animation-delay: calc(var(--i, 0) * 130ms);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const BlockTitle = styled.p`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 800;
  color: #0f1a2e;
`;

const BlockCount = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #6a7a90;
`;

const SummaryText = styled.p`
  font-size: 13.5px;
  line-height: 1.55;
  color: #34445c;
`;

const ItemButton = styled.button`
  display: flex;
  align-items: flex-start;
  gap: 11px;
  width: 100%;
  padding: 9px 8px;
  margin: 0 -8px;
  border: none;
  border-radius: 9px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #f1f5fa;
  }

  &:focus-visible {
    outline: 2px solid ${BLUE};
    outline-offset: 1px;
  }
`;

const CheckBox = styled.span`
  width: 20px;
  height: 20px;
  margin-top: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 6px;
  border: 1.5px solid ${({ $checked }) => ($checked ? "#0e9f6e" : "#b9c5d6")};
  background: ${({ $checked }) => ($checked ? "#0e9f6e" : "#ffffff")};
  color: #ffffff;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
`;

const ItemBody = styled.span`
  min-width: 0;
`;

const ItemTask = styled.span`
  display: block;
  font-size: 13.5px;
  font-weight: 700;
  color: ${({ $checked }) => ($checked ? "#8a98ab" : "#0f1a2e")};
  text-decoration: ${({ $checked }) => ($checked ? "line-through" : "none")};
`;

const ItemChips = styled.span`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
`;

const Chip = styled.span`
  padding: 3px 9px;
  border-radius: 999px;
  background: #eef3f9;
  font-size: 11.5px;
  font-weight: 600;
  color: #4a5b73;
`;

const DecisionList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 8px;
  list-style: none;
`;

const Decision = styled.li`
  padding-left: 12px;
  border-left: 3px solid ${BLUE};
  font-size: 13.5px;
  line-height: 1.4;
  color: #34445c;
`;

const SkeletonBar = styled.div`
  height: 11px;
  border-radius: 6px;
  background: #eef2f7;
`;

const Skeleton = styled.div`
  display: flex;
  flex-direction: column;
  gap: 11px;
  margin-top: 26px;

  ${({ $active }) =>
    $active &&
    css`
      ${SkeletonBar} {
        background: linear-gradient(90deg, #eef2f7 30%, #dbe8f6 50%, #eef2f7 70%);
        background-size: 200% 100%;
        animation: ${shimmer} 1.4s linear infinite;
      }
    `}

  @media (prefers-reduced-motion: reduce) {
    ${SkeletonBar} {
      animation: none;
    }
  }
`;

const ReplayRow = styled.div`
  margin-top: 18px;
  min-height: 34px;
`;

const ReplayButton = styled.button`
  padding: 8px 14px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: transparent;
  color: #dbe5f1;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  visibility: ${({ $hidden }) => ($hidden ? "hidden" : "visible")};
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.07);
  }

  &:focus-visible {
    outline: 2px solid ${LIGHT_BLUE};
    outline-offset: 3px;
  }
`;


const Section = styled.section`
  padding: 72px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.09);
  scroll-margin-top: 16px;
`;

const SectionTitle = styled.h2`
  font-size: clamp(1.6rem, 2.6vw, 2.1rem);
  font-weight: 800;
  letter-spacing: -0.015em;
`;

const Steps = styled.ol`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 40px;
  margin-top: 40px;
  list-style: none;

  @media (max-width: 760px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 32px;
  }
`;

const Step = styled.li`
  position: relative;
  padding-top: 22px;
  border-top: 2px solid rgba(108, 195, 255, 0.35);
`;

const StepNumber = styled.p`
  font-size: 15px;
  font-weight: 800;
  color: ${LIGHT_BLUE};
`;

const StepTitle = styled.h3`
  margin-top: 10px;
  font-size: 18px;
  font-weight: 700;
`;

const StepText = styled.p`
  margin-top: 8px;
  max-width: 340px;
  font-size: 15px;
  line-height: 1.6;
  color: ${MUTED};
`;

const Facts = styled.dl`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 64px;
  margin-top: 36px;

  @media (max-width: 760px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Fact = styled.div`
  padding: 24px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.09);
`;

const FactTitle = styled.dt`
  font-size: 17px;
  font-weight: 700;
`;

const FactText = styled.dd`
  margin-top: 8px;
  max-width: 420px;
  font-size: 15px;
  line-height: 1.6;
  color: ${MUTED};
`;

const Closing = styled.section`
  padding: 72px 0 80px;
  border-top: 1px solid rgba(255, 255, 255, 0.09);
`;

const ClosingTitle = styled.h2`
  font-size: clamp(1.8rem, 3.2vw, 2.5rem);
  font-weight: 800;
  letter-spacing: -0.02em;
`;

const Footer = styled.footer`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 0 36px;
  border-top: 1px solid rgba(255, 255, 255, 0.09);
`;

const FooterBrand = styled.p`
  font-size: 14px;
  font-weight: 700;
  color: #6b7788;
`;

const FooterLink = styled(Link)`
  font-size: 14px;
  color: ${MUTED};
  text-decoration: none;

  &:hover {
    color: #ffffff;
  }

  &:focus-visible {
    outline: 2px solid ${LIGHT_BLUE};
    outline-offset: 4px;
    border-radius: 4px;
  }
`;