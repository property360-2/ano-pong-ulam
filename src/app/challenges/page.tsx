import Link from "next/link"
import { prisma } from "@/lib/db"
import Header from "@/components/Header"
import { MdEmojiEvents, MdPeople, MdWorkspacePremium } from "react-icons/md"

export const dynamic = "force-dynamic"

export default async function ChallengesPage() {
  const challenges = await prisma.challenge.findMany({
    orderBy: { startDate: "desc" },
    include: { _count: { select: { entries: true } } },
  })

  return (
    <>
      <Header />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Cook-Along Challenges</h1>
        <p className="text-stone-500 mb-8">Join weekly challenges, cook with the community, and win bragging rights.</p>

        {challenges.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
            <span className="text-5xl block mb-4"><MdEmojiEvents /></span>
            <h2 className="text-xl font-semibold mb-2">No active challenges</h2>
            <p className="text-stone-500">Check back soon for the next cook-along!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {challenges.map((challenge) => {
              const isActive = new Date() >= challenge.startDate && new Date() <= challenge.endDate
              const isUpcoming = new Date() < challenge.startDate

              return (
                <Link
                  key={challenge.id}
                  href={`/challenges/${challenge.id}`}
                  className="bg-white rounded-xl border border-stone-200 p-6 hover:shadow-sm hover:border-amber-200 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">{challenge.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold">{challenge.title}</h2>
                        {isActive && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">
                            Active
                          </span>
                        )}
                        {isUpcoming && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                            Upcoming
                          </span>
                        )}
                      </div>
                      {challenge.description && (
                        <p className="text-stone-600 text-sm mb-2">{challenge.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-stone-500 flex-wrap">
                        <span>
                          {challenge.startDate.toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                          {" — "}
                          {challenge.endDate.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        <span className="inline-flex items-center gap-0.5"><MdPeople /> {challenge._count.entries} entries</span>
                        {challenge.prize && <span className="inline-flex items-center gap-0.5"><MdWorkspacePremium /> {challenge.prize}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
