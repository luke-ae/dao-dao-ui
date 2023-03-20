import cloneDeep from 'lodash.clonedeep'
import { ComponentType, useMemo } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import useDeepCompareEffect from 'use-deep-compare-effect'

import {
  ActionCardLoader,
  ActionSelector,
  JoystickEmoji,
  Loader,
  RadioInput,
} from '@dao-dao/stateless'
import {
  AddressInputProps,
  CosmosMsgFor_Empty,
  LoadingData,
  StatefulEntityDisplayProps,
} from '@dao-dao/types'
import {
  Action,
  ActionAndData,
  ActionComponent,
  ActionKeyAndData,
  LoadedActions,
} from '@dao-dao/types/actions'
import {
  CHAIN_BECH32_PREFIX,
  decodeMessages,
  isValidAddress,
} from '@dao-dao/utils'

import { SuspenseLoader } from '../../components'
import { ActionCard } from './ActionCard'
import { ActionsRenderer } from './ActionsRenderer'

export interface AuthzExecOptions {
  actions: Action[]
  loadedActions: LoadedActions
  orderedActions: Action[]
  // TODO Authz authorzations? Maybe just an info notice.
  AddressInput: ComponentType<AddressInputProps<AuthzExecData>>
  EntityDisplay: ComponentType<StatefulEntityDisplayProps>
}

export type AuthzExecData = {
  coreAddress: string
  msgs: CosmosMsgFor_Empty[]

  // Interal action data so that errors are added to main form.
  _actions?: ActionKeyAndData[]
}

export const AuthzExecComponent: ActionComponent<AuthzExecOptions> = (
  props
) => {
  const { t } = useTranslation()
  const { watch, setValue, register } = useFormContext<AuthzExecData>()
  const {
    fieldNamePrefix,
    onRemove,
    errors,
    isCreating,
    options: { AddressInput, EntityDisplay },
  } = props

  const coreAddress = watch((fieldNamePrefix + 'coreAddress') as 'coreAddress')

  return (
    <ActionCard
      Icon={JoystickEmoji}
      onRemove={onRemove}
      title={t('title.daoAdminExec')}
    >
      <p className="title-text">{t('title.dao')}</p>
      {/* <div className="mb-2">
          {childDaos.loading ? (
          <Loader />
          ) : isCreating ? (
          childDaos.data.length > 0 ? (
          <RadioInput
          fieldName={(fieldNamePrefix + 'coreAddress') as 'coreAddress'}
          options={childDaos.data.map((childDao) => ({
          display: <EntityDisplay address={childDao} hideImage noCopy />,
          value: childDao,
          }))}
          setValue={setValue}
          watch={watch}
          />
          ) : (
          <AddressInput
          error={errors?.coreAddress}
          fieldName={(fieldNamePrefix + 'coreAddress') as 'coreAddress'}
          register={register}
          type="contract"
          validation={[validateContractAddress]}
          />
          )
          ) : (
          <EntityDisplay address={coreAddress} />
          )}
          </div> */}
      {isValidAddress(coreAddress, CHAIN_BECH32_PREFIX) && (
        <>
          <p className="title-text">{t('title.actions')}</p>
          {isCreating ? (
            <AuthzExecActionEditor {...props} />
          ) : (
            <AuthzExecActionRenderer {...props} />
          )}
        </>
      )}
    </ActionCard>
  )
}

export const AuthzExecActionEditor: ActionComponent<AuthzExecOptions> = ({
  fieldNamePrefix,
  isCreating,
  errors,
  options: { actions, loadedActions },
}) => {
  const { watch, control, resetField, setValue, clearErrors, setError } =
    useFormContext<AuthzExecData>()

  const {
    fields: actionDataFields,
    append: appendAction,
    remove: removeAction,
  } = useFieldArray({
    name: (fieldNamePrefix + '_actions') as '_actions',
    control,
  })

  // Update action msgs from actions form data.
  let msgs: CosmosMsgFor_Empty[] = []
  try {
    msgs =
      (watch((fieldNamePrefix + '_actions') as '_actions')
        ?.map(({ key, data }) => loadedActions[key]?.transform(data))
        // Filter out undefined messages.
        .filter(Boolean) as CosmosMsgFor_Empty[]) ?? []

    if (errors?.msgs) {
      clearErrors((fieldNamePrefix + 'msgs') as 'msgs')
    }
  } catch (err) {
    console.error(err)

    if (!errors?.msgs) {
      setError((fieldNamePrefix + 'msgs') as 'msgs', {
        type: 'manual',
        message: err instanceof Error ? err.message : `${err}`,
      })
    }
  }

  useDeepCompareEffect(() => {
    if (msgs) {
      setValue((fieldNamePrefix + 'msgs') as 'msgs', msgs)
    }
  }, [msgs])

  // TODO limit to one actions

  return (
    <>
      {actionDataFields.length > 0 && (
        <div className="mb-4 flex flex-col gap-2">
          {actionDataFields.map(({ id, key, data }, index) => {
            const Component = loadedActions[key]?.action?.Component
            if (!Component) {
              return null
            }

            return (
              <SuspenseLoader key={id} fallback={<ActionCardLoader />}>
                <Component
                  allActionsWithData={actionDataFields}
                  data={data}
                  fieldNamePrefix={fieldNamePrefix + `_actions.${index}.data.`}
                  index={index}
                  {...(isCreating
                    ? {
                        isCreating,
                        errors: errors?._actions?.[index]?.data || {},
                        addAction: appendAction,
                        onRemove: () => {
                          // Reset the data field to avoid stale data. Honestly
                          // not sure why this has to happen; I figured the
                          // `remove` call would do this automatically. Some
                          // actions, like Execute Smart Contract, don't seem to
                          // need this, while others, like the Token Swap
                          // actions, do.
                          resetField(
                            (fieldNamePrefix +
                              `_actions.${index}.data`) as `_actions.${number}.data`,
                            {
                              defaultValue: {},
                            }
                          )
                          // Remove the action.
                          removeAction(index)
                        },
                      }
                    : {
                        isCreating,
                      })}
                />
              </SuspenseLoader>
            )
          })}
        </div>
      )}

      {actions.length === 0 ? (
        <Loader />
      ) : (
        <div className="self-start">
          <ActionSelector
            actions={actions}
            onSelectAction={({ key }) => {
              appendAction({
                key,
                // Clone to prevent form from mutating the original object.
                data: cloneDeep(loadedActions[key]?.defaults ?? {}),
              })
            }}
          />
        </div>
      )}
    </>
  )
}

export const AuthzExecActionRenderer: ActionComponent<AuthzExecOptions> = ({
  fieldNamePrefix,
  options: { orderedActions },
}) => {
  const { watch } = useFormContext<AuthzExecData>()
  const msgs = watch((fieldNamePrefix + 'msgs') as 'msgs')

  const decodedMessages = useMemo(() => decodeMessages(msgs), [msgs])

  // Call relevant action hooks in the same order every time.
  const actionData = decodedMessages
    .map((message) => {
      const actionMatch = orderedActions
        .map((action) => ({
          action,
          ...action.useDecodedCosmosMsg(message),
        }))
        .find(({ match }) => match)

      return (
        actionMatch && {
          action: actionMatch.action,
          data: actionMatch.data,
        }
      )
    })
    .filter(Boolean) as ActionAndData[]

  return (
    <>
      {orderedActions.length === 0 ? (
        <Loader />
      ) : (
        <ActionsRenderer
          actionData={actionData}
          availableActions={orderedActions}
          hideCopyLink
        />
      )}
    </>
  )
}
