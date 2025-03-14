import React from "react";
import { ScrollView as RNScrollView, ScrollViewProps } from "react-native";

// This is a simple wrapper component to make ScrollView work with className prop
const ScrollView: React.FC<ScrollViewProps & { className?: string }> = ({
  children,
  className,
  ...props
}) => {
  return (
    <RNScrollView className={className} {...props}>
      {children}
    </RNScrollView>
  );
};

export default ScrollView;
