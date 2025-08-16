import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProfileHeader } from "@/components/ProfileHeader";
import { WalletSection } from "@/components/WalletSection";
import { MyTickets } from "@/components/MyTickets";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background theme-transition">
      <Navbar />
      
      {/* Page Header */}
      <section className="pt-24 pb-8 bg-gradient-to-br from-background to-accent/10">
        <div className="container">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              My Profile
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage your account, wallet, and tickets
            </p>
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <section className="py-12">
        <div className="container max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Profile & Wallet */}
            <div className="lg:col-span-1 space-y-6">
              <ProfileHeader />
              <WalletSection />
            </div>
            
            {/* Right Column - Tickets */}
            <div className="lg:col-span-2">
              <MyTickets />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Profile;