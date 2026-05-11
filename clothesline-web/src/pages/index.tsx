import Link from "next/link"
import { useSession } from "next-auth/react"
import { CloudRain, Sun, Wind, Activity, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TextEffect } from '@/components/motion-primitives/text-effect'
import { AnimatedGroup } from '@/components/motion-primitives/animated-group'
import { HeroHeader } from "@/components/landing/header"

const transitionVariants: any = {
  item: {
    hidden: {
      opacity: 0,
      filter: 'blur(12px)',
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: {
        type: 'spring',
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
}

export default function Home() {
  const { data: session } = useSession()

  return (
    <div className="flex flex-col min-h-screen font-sans overflow-hidden">
      <HeroHeader />

      <main className="flex-1 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block -z-20">
          <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(210,100%,85%,.08)_0,hsla(210,100%,55%,.02)_50%,hsla(210,100%,45%,0)_80%)]" />
          <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(30,100%,85%,.06)_0,hsla(30,100%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
          <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(210,100%,85%,.04)_0,hsla(210,100%,45%,.02)_80%,transparent_100%)]" />
        </div>

        <section>
          <div className="relative pt-24 md:pt-36">
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      delayChildren: 1,
                    },
                  },
                },
                item: {
                  hidden: {
                    opacity: 0,
                    y: 20,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      type: 'spring',
                      bounce: 0.3,
                      duration: 2,
                    },
                  },
                },
              }}
              className="mask-b-from-35% mask-b-to-90% absolute inset-0 top-56 -z-20 lg:top-32">
              {/* <Image
                    src="https://ik.imagekit.io/lrigu76hy/tailark/night-background.jpg?updatedAt=1745733451120"
                    alt="background"
                    className="hidden size-full object-cover dark:block"
                    width="3276"
                    height="4095"
                /> */}
              <div
                className="fixed inset-0 -z-10 hidden dark:block size-full"
                style={{
                  backgroundImage: 'linear-gradient(to bottom right, #020617, #0f172a, #1e293b)',
                }}
              />
            </AnimatedGroup>

            <div
              aria-hidden
              className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"
            />

            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                <AnimatedGroup variants={transitionVariants}>
                  <div
                    className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950">
                    <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                    <span className="text-foreground text-sm">IoT Powered Clothesline System</span>
                  </div>
                </AnimatedGroup>

                <TextEffect
                  preset="fade-in-blur"
                  speedSegment={0.3}
                  as="h1"
                  className="mx-auto mt-8 max-w-4xl text-balance text-5xl max-md:font-semibold md:text-7xl lg:mt-16 xl:text-[5.25rem]">
                  Never worry about sudden rain again.
                </TextEffect>
                <TextEffect
                  per="line"
                  preset="fade-in-blur"
                  speedSegment={0.3}
                  delay={0.5}
                  as="p"
                  className="mx-auto mt-8 max-w-2xl text-balance text-lg text-zinc-600 dark:text-zinc-400">
                  SmartLine automatically retracts your laundry when it rains or gets dark, and brings it back out when the sun shines.
                </TextEffect>

                <AnimatedGroup
                  variants={{
                    container: {
                      visible: {
                        transition: {
                          staggerChildren: 0.05,
                          delayChildren: 0.75,
                        },
                      },
                    },
                    ...transitionVariants,
                  } as any}
                  className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <div
                    key={1}
                    className="bg-foreground/10 rounded-[calc(var(--radius-xl)+0.125rem)] border p-0.5">
                    <Button
                      asChild
                      size="lg"
                      className="rounded-xl px-8 text-base h-12">
                      <Link href={session ? "/dashboard" : "/auth/login"}>
                        <span className="text-nowrap">Open Dashboard</span>
                      </Link>
                    </Button>
                  </div>
                  <Button
                    key={2}
                    asChild
                    size="lg"
                    variant="ghost"
                    className="h-12 rounded-xl px-8 text-base">
                    <Link href="#features">
                      <span className="text-nowrap">Explore Features</span>
                    </Link>
                  </Button>
                </AnimatedGroup>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 mt-20 relative z-10">
          <div className="max-w-7xl mx-auto px-6 lg:px-14">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto mb-32">
              {[
                { icon: Activity, title: "Real-time Monitoring", desc: "Track temperature, humidity, and light intensity instantly." },
                { icon: CloudRain, title: "Rain Detection", desc: "Instant response to rain drops to save your laundry." },
                { icon: Sun, title: "Smart Scheduling", desc: "Set timers or let the AI decide the best time to dry." }
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center text-center p-8 rounded-3xl bg-background border shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                  <div className="w-12 h-12 rounded-2xl bg-accent dark:bg-foreground flex items-center justify-center mb-6 text-base dark:text-background">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>

            <div id="features" className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Complete control from your <span className="text-primary dark:text-ring ">dashboard</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Monitor all your sensors in real-time. Configure thresholds for temperature, humidity, light, and rain intensity to customize how your clothesline behaves.
                </p>
                <ul className="space-y-4">
                  {[
                    "Three operational modes: Auto, Manual, and Timer",
                    "Detailed hourly charts for all environmental sensors",
                    "Customizable thresholds for automatic retraction",
                    "Remote servo control from anywhere"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                      <span className="text-foreground font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-10">
                  <Link href={session ? "/dashboard" : "/auth/login"}>
                    <Button variant="outline" size="lg" className="rounded-xl">Go to Dashboard</Button>
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-4/3 rounded-2xl bg-muted/50 border overflow-hidden shadow-2xl flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-4 w-full h-full p-8">
                    <div className="bg-background rounded-xl p-4 flex flex-col justify-between shadow-sm border">
                      <div className="text-sm font-medium text-muted-foreground">Temperature</div>
                      <div className="text-4xl font-bold text-foreground">32°C</div>
                      <div className="text-xs text-destructive flex items-center gap-1"><Sun className="w-3 h-3" /> Sunny</div>
                    </div>
                    <div className="bg-background rounded-xl p-4 flex flex-col justify-between shadow-sm border">
                      <div className="text-sm font-medium text-muted-foreground">Humidity</div>
                      <div className="text-4xl font-bold text-foreground">45%</div>
                      <div className="text-xs text-primary flex items-center gap-1"><Wind className="w-3 h-3" /> Ideal</div>
                    </div>
                    <div className="bg-background rounded-xl p-4 col-span-2 shadow-sm border flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">System Status</div>
                        <div className="flex items-center gap-2">
                          <span className="flex h-3 w-3 rounded-full bg-green-500 animate-pulse"></span>
                          <span className="font-bold text-foreground">Active (Auto Mode)</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Servo Position</div>
                        <div className="font-bold text-foreground">Extended (Out)</div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/20 rounded-full blur-2xl -z-10" />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl -z-10" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 lg:px-14 border-t bg-background">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-primary" />
            <span className="text-lg font-bold text-foreground">SmartLine</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 SmartLine IoT Project. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
