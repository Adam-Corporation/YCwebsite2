import React from "react";
import { Github, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black py-16 text-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="flex flex-col items-center mb-8 space-y-4">
          {/* Email as plain text (not a link) */}
          <div className="text-white text-lg font-medium">
            malak.felioune@ensia.edu.dz
          </div>

          {/* Social icons as visual elements only */}
          <div className="flex justify-center space-x-6 mt-4">
            <div className="text-white">
              <Linkedin className="h-6 w-6" aria-label="LinkedIn" />
            </div>
            <div className="text-white">
              <Github className="h-6 w-6" aria-label="GitHub" />
            </div>
            <div className="text-white">
              <Twitter className="h-6 w-6" aria-label="Twitter" />
            </div>
          </div>

          {/* Adding text descriptions of social media links */}
          <div className="text-xs text-gray-400 mt-2">
            LinkedIn: @Malak Felioune | GitHub: @malak-100 | Twitter: @EntrpnrM
          </div>
        </div>

        <p className="text-gray-300 max-w-2xl mx-auto">
          For technical questions and
          other inquiries, please reach out via the email above. Adam is
          currently in development and not yet released, detailed information
          is limited at this time.
        </p>
        <div className="mt-8 text-sm text-gray-500 font-medium "> Malak Felioune, Higher school of artificial intelligence, Algeria</div>
        <div className="mt-8 text-sm text-gray-500 font-medium ">
          &copy; {new Date().getFullYear()} Adam . All rights reserved.
        </div>
      </div>
    </footer>
  );
}
