declare module 'nativewind' {
  import type { ViewProps } from 'react-native';

  export interface StyledProps extends ViewProps {
    className?: string;
  }

  export function styled<T extends React.ComponentType<any>>(
    Component: T
  ): React.ForwardRefExoticComponent<React.PropsWithoutRef<React.ComponentProps<T> & StyledProps> & React.RefAttributes<any>>;
}
