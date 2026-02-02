import { Redirect, Href } from 'expo-router';

/**
 * Default route for the (home,search) group
 * Redirects to the home screen
 */
export default function HomeSearchIndex() {
  return <Redirect href={'/(tabs)/(home,search)/home' as Href} />;
}
