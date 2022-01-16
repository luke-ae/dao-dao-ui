import { ArrowNarrowLeftIcon } from '@heroicons/react/outline'
import Link from 'next/link'

/*
 * Breadcrumb style navivation bar. Expects arguments in the form [[link, name], ...].
 */
export function Breadcrumbs({ crumbs }: { crumbs: Array<[string, string]> }) {
  return (
    <ul className="text-md font-medium text-secondary-focus list-none flex">
      <li key="icon">
        <Link href={crumbs[crumbs.length - 2][0]}>
          <a>
            <ArrowNarrowLeftIcon className="inline w-5 h-5 mb-1" />
          </a>
        </Link>
      </li>
      {crumbs.map(([link, name], idx) => (
        <li key={name}>
          <Link href={link}>
            <a className="mx-2">{name}</a>
          </Link>
          {idx != crumbs.length - 1 && '/'}
        </li>
      ))}
    </ul>
  )
}