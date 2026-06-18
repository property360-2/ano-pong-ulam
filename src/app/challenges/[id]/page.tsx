import { notFound } from "next/navigation"
import Image from "next/image"
import { prisma } from "@/lib/db"
import Header from "@/components/Header"
import { MdPeople, MdWorkspacePremium, MdCameraAlt, MdStar } from "react-icons/md"

export const dynamic = "force-dynamic"

type Params = Promise<{ id: string }>

export default async function ChallengeDetailPage(props: { params: Params }) {
  const { id } = await props.params

  const challenge = await prisma.challenge.findUnique({
    where: { id: BigInt(id) },
    include: {
      entries: {
        orderBy: { voteCount: "desc" },
        include: {
          user: { select: { username: true, avatarUrl: true } },
          recipe: { select: { slug: true, title: true } },
        },
      },
      _count: { select: { entries: true } },
    },
  })

  if (!challenge) notFound()

  const isActive = new Date() >= challenge.startDate && new Date() <= challenge.endDate

  return (
    <>
      <Header />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8">
        <div className="bg-white rounded-xl border border-stone-200 p-6 md:p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <span className="text-5xl">{challenge.emoji}</span>
            <div>
              <h1 className="text-3xl font-bold mb-1">{challenge.title}</h1>
              {challenge.description && (
                <p className="text-stone-600 mb-3">{challenge.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500">
                <span>
                  {challenge.startDate.toLocaleDateString("en-PH", {
                    month: "long", day: "numeric",
                  })}
                  {" — "}
                  {challenge.endDate.toLocaleDateString("en-PH", {
                    month: "long", day: "numeric", year: "numeric",
                  })}
                </span>
                <span className="inline-flex items-center gap-0.5"><MdPeople /> {challenge._count.entries} entries</span>
                {challenge.prize && <span className="inline-flex items-center gap-0.5"><MdWorkspacePremium /> {challenge.prize}</span>}
                {isActive && (
                  <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded font-medium">
                    Active
                  </span>
                )}
              </div>
              {challenge.themeTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {challenge.themeTags.map((tag) => (
                    <span key={tag} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Entries</h2>

        {challenge.entries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-stone-200">
            <span className="text-4xl block mb-3"><MdCameraAlt /></span>
            <p className="text-stone-500">No entries yet. Be the first to join!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenge.entries.map((entry) => (
              <div key={entry.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <div className="aspect-square bg-stone-100 overflow-hidden relative">
                  <Image
                    src={entry.photoUrl}
                    alt={entry.caption || "Challenge entry"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">@{entry.user.username}</span>
                    <span className="text-sm text-amber-600 font-bold inline-flex items-center gap-0.5"><MdStar /> {entry.voteCount}</span>
                  </div>
                  {entry.caption && <p className="text-sm text-stone-600">{entry.caption}</p>}
                  {entry.recipe && (
                    <a
                      href={`/recipes/${entry.recipe.slug}`}
                      className="text-sm text-amber-600 hover:underline mt-2 inline-block"
                    >
                      View Recipe → ({entry.recipe.title})
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
