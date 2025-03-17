import React, { PropsWithChildren } from "react";
import { ScrollViewProps } from "react-native";
import { ScrollView as StyledScrollView } from "@/lib/nativewind-setup";
import { cn } from "@/lib/utils";

/**
 * Enhanced ScrollView component that supports className prop and proper TypeScript typing
 * 
 * @param props - Component props including className and standard ScrollView props
 * @returns Enhanced ScrollView component with NativeWind support
 */
interface EnhancedScrollViewProps extends ScrollViewProps {
  className?: string;
  contentContainerClassName?: string;
}

const ScrollView = React.memo(function ScrollView({
  children,
  className,
  contentContainerClassName,
  contentContainerStyle,
  ...props
}: PropsWithChildren<EnhancedScrollViewProps>) {
  return (
    <StyledScrollView 
      className={cn("bg-transparent", className)} 
      contentContainerClassName={contentContainerClassName}
      contentContainerStyle={contentContainerStyle}
      {...props}
    >
      {children}
    </StyledScrollView>
  );
});

export default ScrollView;
