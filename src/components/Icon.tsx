import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type IconProps = {
  name: string;
  size: number;
  color: string;
};

const Icon = ({name, size, color}: IconProps) => {
  return React.createElement(MaterialCommunityIcons, {name, size, color});
};

export default Icon;
