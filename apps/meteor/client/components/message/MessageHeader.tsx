import type { IMessage } from '@rocket.chat/core-typings';
import {
	MessageHeader as FuselageMessageHeader,
	MessageName,
	MessageTimestamp,
	MessageUsername,
	MessageStatusPrivateIndicator,
	MessageNameContainer,
} from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { KeyboardEvent, ReactElement } from 'react';
import React, { memo } from 'react';

import { getUserDisplayName } from '../../../lib/getUserDisplayName';
import { useFormatDateAndTime } from '../../hooks/useFormatDateAndTime';
import { useFormatTime } from '../../hooks/useFormatTime';
import { useUserData } from '../../hooks/useUserData';
import type { UserPresence } from '../../lib/presence';
import { useChat } from '../../views/room/contexts/ChatContext';
import StatusIndicators from './StatusIndicators';
import MessageRoles from './header/MessageRoles';
import { useMessageRoles } from './header/hooks/useMessageRoles';
import { useMessageListShowUsername, useMessageListShowRealName, useMessageListShowRoles } from './list/MessageListContext';

type MessageHeaderProps = {
	message: IMessage;
};

const MessageHeader = ({ message }: MessageHeaderProps): ReactElement => {
	const t = useTranslation();

	const formatTime = useFormatTime();
	const formatDateAndTime = useFormatDateAndTime();

	const showRealName = useMessageListShowRealName();
	const user: UserPresence = { ...message.u, roles: [], ...useUserData(message.u._id) };
	const usernameAndRealNameAreSame = !user.name || user.username === user.name;
	const showUsername = useMessageListShowUsername() && showRealName && !usernameAndRealNameAreSame;

	const showRoles = useMessageListShowRoles();
	const roles = useMessageRoles(message.u._id, message.rid, showRoles);
	const shouldShowRolesList = roles.length > 0;

	const chat = useChat();

	return (
		<FuselageMessageHeader>
			<MessageNameContainer
				tabIndex={0}
				role='button'
				aria-label={getUserDisplayName(user.name, user.username, showRealName)}
				{...(user.username !== undefined &&
					chat?.userCard && {
						onClick: (e) => chat?.userCard.openUserCard(e, message.u.username),
						onKeyDown: (e: KeyboardEvent<HTMLSpanElement>) => {
							(e.code === 'Enter' || e.code === 'Space') && chat?.userCard.openUserCard(e, message.u.username);
						},
						style: { cursor: 'pointer' },
					})}
			>
				<MessageName
					{...(!showUsername && { 'data-qa-type': 'username' })}
					title={!showUsername && !usernameAndRealNameAreSame ? `@${user.username}` : undefined}
					data-username={user.username}
				>
					{message.alias || getUserDisplayName(user.name, user.username, showRealName)}
				</MessageName>
				{showUsername && (
					<>
						{' '}
						<MessageUsername data-username={user.username} data-qa-type='username'>
							@{user.username}
						</MessageUsername>
					</>
				)}
			</MessageNameContainer>
			{shouldShowRolesList && <MessageRoles roles={roles} isBot={message.bot} />}
			<MessageTimestamp title={formatDateAndTime(message.ts)}>{formatTime(message.ts)}</MessageTimestamp>
			{message.private && <MessageStatusPrivateIndicator>{t('Only_you_can_see_this_message')}</MessageStatusPrivateIndicator>}
			<StatusIndicators message={message} />
		</FuselageMessageHeader>
	);
};

export default memo(MessageHeader);
