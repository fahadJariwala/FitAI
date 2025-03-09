import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface IconProps {
  name: string;
  size: number;
  color: string;
  style?: any;
}

export const Icon: React.FC<IconProps> = ({ name, size, color, style }) => {
  return <MaterialCommunityIcons name={name} size={size} color={color} style={style} />;
};
