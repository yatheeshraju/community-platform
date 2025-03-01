import { render, fireEvent } from '@testing-library/react'
import { Provider } from 'mobx-react'
import { HowtoForm } from './Howto.form'
import { MemoryRouter } from 'react-router'
import { ThemeProvider } from 'theme-ui'
import { useCommonStores } from 'src'
import { FactoryHowto } from 'src/test/factories/Howto'
import { testingThemeStyles } from 'src/test/utils/themeUtils'
const Theme = testingThemeStyles

jest.mock('src/index', () => {
  return {
    useCommonStores: () => ({
      stores: {
        categoriesStore: {
          allCategories: [],
        },
        howtoStore: {
          uploadStatus: {
            Start: false,
            Cover: false,
            'Step Images': false,
            Files: false,
            Database: false,
            Complete: false,
          },
        },
        tagsStore: {
          categoryTags: [
            {
              categories: ['how-to'],
              label: 'test tag 1',
              image: 'test img',
            },
          ],
          setTagsCategory: jest.fn(),
        },
      },
    }),
  }
})

describe('Howto form', () => {
  describe('Invalid file warning', () => {
    it('Does not appear when submitting only fileLink', async () => {
      // Arrange
      const formValues = FactoryHowto({ fileLink: 'www.test.com' })
      // Act
      const wrapper = getWrapper(formValues, 'edit', {})

      // Assert
      expect(
        wrapper.queryByTestId('invalid-file-warning'),
      ).not.toBeInTheDocument()
    })

    it('Does not appear when submitting only files', async () => {
      // Arrange
      const formValues = FactoryHowto({
        files: [
          new File(['test file content'], 'test-file.pdf', {
            type: 'application/pdf',
          }),
        ],
      })

      // Act
      const wrapper = getWrapper(formValues, 'edit', {})

      // Assert
      expect(
        wrapper.queryByTestId('invalid-file-warning'),
      ).not.toBeInTheDocument()
    })

    it('Appears when submitting 2 file types', async () => {
      // Arrange
      const formValues = FactoryHowto({
        files: [
          new File(['test file content'], 'test-file.pdf', {
            type: 'application/pdf',
          }),
        ],
        fileLink: 'www.test.com',
      })

      // Act
      const wrapper = getWrapper(formValues, 'edit', {})

      // Assert
      expect(wrapper.queryByTestId('invalid-file-warning')).toBeInTheDocument()
    })

    it('Does not appear when files are removed and filelink added', async () => {
      // Arrange
      const formValues = FactoryHowto({
        files: [
          new File(['test file content'], 'test-file.pdf', {
            type: 'application/pdf',
          }),
        ],
      })

      // Act
      const wrapper = getWrapper(formValues, 'edit', {})

      // clear files
      const reuploadFilesButton = wrapper.getByTestId('re-upload-files')
      fireEvent.click(reuploadFilesButton)

      // add fileLink
      const fileLink = wrapper.getByPlaceholderText(
        'Link to Gdrive, Dropbox, Grabcad etc',
      )
      fireEvent.change(fileLink, { target: { value: '<http://www.test.com>' } })

      // submit form
      const submitFormButton = wrapper.getByTestId('submit-form')
      fireEvent.click(submitFormButton)

      // Assert
      expect(
        wrapper.queryByTestId('invalid-file-warning'),
      ).not.toBeInTheDocument()
    })
  })
})

const getWrapper = (formValues, parentType, navProps) => {
  return render(
    <Provider {...useCommonStores().stores}>
      <ThemeProvider theme={Theme}>
        <MemoryRouter>
          <HowtoForm
            formValues={formValues}
            parentType={parentType}
            {...navProps}
          />
        </MemoryRouter>
      </ThemeProvider>
    </Provider>,
  )
}
