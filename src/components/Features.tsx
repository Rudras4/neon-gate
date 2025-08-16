import { Shield, Zap, Smartphone, Repeat, Users, Lock } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Fraud-Proof NFTs",
    description: "Every ticket is a unique NFT on the blockchain, making counterfeiting impossible.",
  },
  {
    icon: Zap,
    title: "Instant Transfers",
    description: "Transfer tickets securely to friends or sell on secondary markets instantly.",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Scan QR codes, verify authenticity, and manage tickets from your mobile wallet.",
  },
  {
    icon: Repeat,
    title: "Fair Resale",
    description: "Built-in resale marketplace with organizer-set price limits and royalties.",
  },
  {
    icon: Users,
    title: "Community Owned",
    description: "Collect tickets as digital memorabilia and build your event history.",
  },
  {
    icon: Lock,
    title: "Secure Storage",
    description: "Your tickets are stored securely in your Web3 wallet, fully under your control.",
  },
];

export function Features() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose Web3 Ticketing?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the next generation of event ticketing with blockchain technology. 
            Secure, transparent, and designed for the digital age.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card-elevated p-6 text-center group hover:border-primary/20"
            >
              <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}