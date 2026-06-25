import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and Conditions for Ano Pong Ulam? — the Filipino recipe community.",
}

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content:
      "By creating an account or using Ano Pong Ulam? (&ldquo;the Site&rdquo;), you agree to be bound by these Terms &amp; Conditions. If you do not agree, do not use the Site.",
  },
  {
    id: "accounts",
    title: "2. User Accounts",
    content:
      "You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You must provide accurate, current, and complete information during registration. You may not use another person&rsquo;s account without permission.",
  },
  {
    id: "user-content",
    title: "3. User-Generated Content",
    content:
      "You retain ownership of recipes, photos, comments, and other content you submit (&ldquo;Your Content&rdquo;). By submitting Your Content, you grant the Site a non-exclusive, royalty-free, worldwide license to display, distribute, and promote it on the platform. You represent that Your Content does not infringe any third-party rights.",
  },
  {
    id: "conduct",
    title: "4. Code of Conduct",
    content:
      "You agree to use the Site respectfully. Prohibited conduct includes: harassment, hate speech, spam, impersonation, posting harmful or misleading information, and violating any applicable laws. We reserve the right to remove content or suspend accounts that violate this policy.",
  },
  {
    id: "intellectual-property",
    title: "5. Intellectual Property",
    content:
      "The Site&rsquo;s name, logo, and design are our trademarks. Recipe content belongs to their respective authors. You may not reproduce, distribute, or commercially exploit content without the owner&rsquo;s consent.",
  },
  {
    id: "disclaimer",
    title: "6. Disclaimer",
    content:
      "All recipes and cooking advice are provided &ldquo;as-is&rdquo; for informational purposes. We do not guarantee specific results. Always exercise caution in the kitchen — handle ingredients, equipment, and heat sources safely.",
  },
  {
    id: "liability",
    title: "7. Limitation of Liability",
    content:
      "Ano Pong Ulam? and its operators are not liable for any damages arising from your use of the Site, including but not limited to allergic reactions, kitchen accidents, or data loss. Use the platform at your own risk.",
  },
  {
    id: "changes",
    title: "8. Changes to Terms",
    content:
      "We may update these terms at any time. Continued use of the Site after changes constitutes acceptance of the new terms. We will notify registered users of material changes via email or site notice.",
  },
  {
    id: "contact",
    title: "9. Contact",
    content:
      "For questions about these terms, reach us at support@anopongulam.com.",
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <Link href="/" className="inline-block mb-6">
          <span className="font-bold text-xl">
            Ano Pong <span className="text-amber-600">Ulam?</span>
          </span>
        </Link>

        <h1 className="text-3xl font-bold text-stone-900 mb-2">Terms &amp; Conditions</h1>
        <p className="text-stone-500 text-sm mb-8">Last updated: June 25, 2026</p>

        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6">
          {sections.map((s) => (
            <section key={s.id} id={s.id}>
              <h2
                className="text-lg font-bold text-stone-900 mb-2"
                dangerouslySetInnerHTML={{ __html: s.title }}
              />
              <p
                className="text-stone-600 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: s.content }}
              />
            </section>
          ))}
        </div>

        <p className="text-center text-xs text-stone-400 mt-8">
          <Link href="/" className="text-amber-600 hover:underline">Back to Home</Link>
        </p>
      </div>
    </div>
  )
}
