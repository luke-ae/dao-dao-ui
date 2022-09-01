import { ComponentPropsWithoutRef, forwardRef } from 'react'

import {
  IconButtonifiedChildren,
  IconButtonifierProps,
  getIconButtonifiedClassNames,
} from './IconButtonifier'

export type IconButtonProps = ComponentPropsWithoutRef<'button'> &
  IconButtonifierProps

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ type = 'button', ...props }, ref) {
    return (
      <button
        {...props}
        className={getIconButtonifiedClassNames(props)}
        ref={ref}
        type={type}
      >
        <IconButtonifiedChildren {...props} />
      </button>
    )
  }
)
