import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  GraduationCap,
  Shield,
  Users,
  FileCheck,
  Search,
  Building,
} from "lucide-react";
import ConnectWalletButton from "@/components/connect-wallet-button";
import { Navigation } from "@/components/navigation";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CertifyEdu</h1>
                <p className="text-sm text-gray-600">
                  Certificate Management System
                </p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Navigation
                items={[
                  {
                    href: "/verify",
                    label: "Verify Certificate",
                  },
                ]}
              />
              <ConnectWalletButton />
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Secure Digital Certificate
              <span className="text-blue-600"> Management</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              A comprehensive platform for universities to issue, manage, and
              verify academic certificates. Built with security, transparency,
              and ease of use in mind.
            </p>
            <div className="flex justify-center">
              <ConnectWalletButton />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Platform Features
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage academic certificates across
              multiple institutions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Multi-Institution Support</CardTitle>
                <CardDescription>
                  Manage certificates for multiple universities and educational
                  institutions from a single platform
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Secure Verification</CardTitle>
                <CardDescription>
                  Advanced cryptographic verification ensures certificate
                  authenticity and prevents fraud
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <FileCheck className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Easy Certificate Issuance</CardTitle>
                <CardDescription>
                  Streamlined process for administrators to issue and manage
                  digital certificates
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Student Portal</CardTitle>
                <CardDescription>
                  Students can easily access, download, and share their verified
                  certificates
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle>Public Verification</CardTitle>
                <CardDescription>
                  Anyone can verify certificate authenticity using our public
                  verification system
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>Comprehensive Analytics</CardTitle>
                <CardDescription>
                  Track certificate issuance, verification requests, and
                  institutional performance
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-blue-100 text-lg mb-8">
              Join leading educational institutions using CertifyEdu for secure
              certificate management
            </p>
            <div className="flex justify-center">
              <ConnectWalletButton>Get Started Today</ConnectWalletButton>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold">CertifyEdu</span>
              </div>
              <p className="text-gray-400 text-sm">
                Secure digital certificate management for educational
                institutions worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link
                    href="/verify"
                    className="hover:text-white transition-colors"
                  >
                    Verify Certificate
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register-institution"
                    className="hover:text-white transition-colors"
                  >
                    Register Institution
                  </Link>
                </li>
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="hover:text-white transition-colors"
                  >
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 CertifyEdu. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
