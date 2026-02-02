/**
 * Navigation Route Parameter Types
 * For type-safe navigation with Expo Router
 */

export type RootStackParamList = {
  index: undefined;
  '(auth)': undefined;
  '(tabs)': undefined;
};

export type AuthStackParamList = {
  welcome: undefined;
  login: undefined;
  register: undefined;
  'forgot-password': undefined;
};

export type TabsParamList = {
  '(home,search)': undefined;
  eatlist: undefined;
  profile: undefined;
};

export type HomeSearchStackParamList = {
  home: undefined;
  search: undefined;
  map: undefined;
  'restaurant/[id]': { id: string };
  'review/[id]': { id: string };
  'user/[id]': { id: string };
};

export type ProfileStackParamList = {
  index: undefined;
  edit: undefined;
  settings: undefined;
};

export type ModalsParamList = {
  'create-review': { restaurantId: string };
  filter: undefined;
};
