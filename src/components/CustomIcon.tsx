import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface CustomIconProps {
  name: string;
  size: number;
  color: string;
}

const CustomIcon: React.FC<CustomIconProps> = ({name, size, color}) => {
  return <MaterialCommunityIcons name={name} size={size} color={color} />;
};

export default CustomIcon;
