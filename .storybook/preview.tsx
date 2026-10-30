import type { Preview } from '@storybook/nextjs-vite'
import { pretendard } from '../app/fonts'
import '../app/globals.css'

const preview: Preview = {
  decorators: [
    // app/layout.tsx와 동일하게 Pretendard 변수 + 기본 폰트 적용
    (Story) => (
      <div className={`${pretendard.variable} font-pretendard antialiased`}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    options: {
      storySort: {
        order: [
          'Foundations', ['Design Tokens', 'Color Palette', 'Typography', 'Iconography'],
          'Components', ['Actions', 'Forms', 'Navigation', 'Feedback', 'Etc'],
          '*',
        ],
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;
