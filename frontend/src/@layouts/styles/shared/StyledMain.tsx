// Third-party Imports
import styled from '@emotion/styled'

// Config Imports
import themeConfig from '@configs/themeConfig'

type StyledMainProps = {
  isContentCompact: boolean
}

const StyledMain = styled.main<StyledMainProps>`
  min-inline-size: 0;
  padding: clamp(12px, 2vw, ${themeConfig.layoutPadding}px);
  ${({ isContentCompact }) =>
    isContentCompact &&
    `
    margin-inline: auto;
    max-inline-size: ${themeConfig.compactContentWidth}px;
  `}
`

export default StyledMain
