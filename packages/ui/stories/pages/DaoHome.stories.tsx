import { ComponentMeta, ComponentStory } from '@storybook/react'
import { useState } from 'react'

import { useDaoInfoContext } from '@dao-dao/common'

import {
  DaoInfoBar,
  DaoInfoBarProps,
  MembersTabProps,
  ProposalsTabProps,
  SubDaosTabProps,
  TreasuryAndNftsTabProps,
} from 'components'
import { ProfileMemberCard, ProfileMemberCardProps } from 'components/profile'
import { DaoPageWrapperDecorator, makeAppLayoutDecorator } from 'decorators'
import { DaoHome } from 'pages/DaoHome'
import { Default as DaoInfoBarStory } from 'stories/components/dao/DaoInfoBar.stories'
import { Default as MembersTabStory } from 'stories/components/dao/tabs/MembersTab.stories'
import { Default as ProposalsTabStory } from 'stories/components/dao/tabs/ProposalsTab.stories'
import { Default as SubDaosTabStory } from 'stories/components/dao/tabs/SubDaosTab.stories'
import { Default as TreasuryAndNftsTabStory } from 'stories/components/dao/tabs/TreasuryAndNftsTab.stories'
import { Default as ProfileMemberCardStory } from 'stories/components/profile/ProfileMemberCard.stories'

export default {
  title: 'DAO DAO V2 / pages / DaoHome',
  component: DaoHome,
  decorators: [
    // Direct ancestor of rendered story.
    DaoPageWrapperDecorator,
    makeAppLayoutDecorator({
      rightSidebar: (
        <ProfileMemberCard
          {...(ProfileMemberCardStory.args as ProfileMemberCardProps)}
        />
      ),
    }),
  ],
} as ComponentMeta<typeof DaoHome>

const Template: ComponentStory<typeof DaoHome> = (args) => {
  const [pinned, setPinned] = useState(false)

  return (
    <DaoHome
      {...args}
      daoInfo={useDaoInfoContext()}
      onPin={() => setPinned((p) => !p)}
      pinned={pinned}
    />
  )
}

export const Default = Template.bind({})
Default.args = {
  daoInfoBar: <DaoInfoBar {...(DaoInfoBarStory.args as DaoInfoBarProps)} />,
  proposalsTab: (
    <ProposalsTabStory {...(ProposalsTabStory.args as ProposalsTabProps)} />
  ),
  treasuryAndNftsTab: (
    <TreasuryAndNftsTabStory
      {...(TreasuryAndNftsTabStory.args as TreasuryAndNftsTabProps)}
    />
  ),
  subDaosTab: (
    <SubDaosTabStory {...(SubDaosTabStory.args as SubDaosTabProps)} />
  ),
  membersTab: (
    <MembersTabStory {...(MembersTabStory.args as MembersTabProps)} />
  ),
}
Default.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/ZnQ4SMv8UUgKDZsR5YjVGH/DAO-DAO-2.0?node-id=317%3A28615',
  },
}
