import Link from "next/link"
import { MdArrowBack } from "react-icons/md"

type Props = {
  title: React.ReactNode
  icon?: React.ReactNode
  backHref?: string
  children?: React.ReactNode
}

export default function PageHeader({ title, icon, backHref, children }: Props) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        {backHref && (
          <Link
            href={backHref}
            className="text-stone-500 hover:text-amber-600 transition-colors"
          >
            <MdArrowBack className="text-xl" />
          </Link>
        )}
        <h1 className="text-2xl font-bold flex items-center gap-2">
          {icon && <span className="text-amber-600">{icon}</span>}
          {title}
        </h1>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}