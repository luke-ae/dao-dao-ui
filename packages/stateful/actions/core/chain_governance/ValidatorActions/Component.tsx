import { Check, Close } from '@mui/icons-material'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { CodeMirrorInput, InputLabel, SelectInput } from '@dao-dao/stateless'
import { ActionComponent } from '@dao-dao/types/actions'
import { validateJSON } from '@dao-dao/utils'

export enum ValidatorActionType {
  CreateValidator = '/cosmos.staking.v1beta1.MsgCreateValidator',
  EditValidator = '/cosmos.staking.v1beta1.MsgEditValidator',
  UnjailValidator = '/cosmos.slashing.v1beta1.MsgUnjail',
  WithdrawValidatorCommission = '/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission',
}

export const useValidatorActions = (): {
  type: ValidatorActionType
  name: string
}[] => {
  const { t } = useTranslation()

  return [
    {
      type: ValidatorActionType.WithdrawValidatorCommission,
      name: t('title.withdrawValidatorCommission'),
    },
    {
      type: ValidatorActionType.CreateValidator,
      name: t('title.createValidator'),
    },
    {
      type: ValidatorActionType.EditValidator,
      name: t('title.editValidator'),
    },
    {
      type: ValidatorActionType.UnjailValidator,
      name: t('title.unjailValidator'),
    },
  ]
}

export const ValidatorActionsComponent: ActionComponent = ({
  fieldNamePrefix,
  errors,
  isCreating,
}) => {
  const { t } = useTranslation()
  const { control, register, watch } = useFormContext()
  const validatorActions = useValidatorActions()

  const validatorActionType = watch(fieldNamePrefix + 'validatorActionType')

  return (
    <>
      <SelectInput
        defaultValue={validatorActions[0].type}
        disabled={!isCreating}
        error={errors?.validatorActionType}
        fieldName={fieldNamePrefix + 'validatorActionType'}
        register={register}
      >
        {validatorActions.map(({ name, type }, idx) => (
          <option key={idx} value={type}>
            {name}
          </option>
        ))}
      </SelectInput>

      {validatorActionType === ValidatorActionType.CreateValidator && (
        <div className="flex flex-col items-stretch gap-1">
          <InputLabel
            name={t('form.createValidatorMessage')}
            tooltip={t('form.createValidatorMessageTooltip')}
          />
          <CodeMirrorInput
            control={control}
            error={errors?.createMsg}
            fieldName={fieldNamePrefix + 'createMsg'}
            readOnly={!isCreating}
            validation={[validateJSON]}
          />
          {errors?.createMsg?.message ? (
            <p className="text-error flex items-center gap-1 text-sm">
              <Close className="inline w-5" />{' '}
              <span>{errors.createMsg?.message}</span>
            </p>
          ) : (
            <p className="text-success flex items-center gap-1 text-sm">
              <Check className="inline w-5" /> {t('info.jsonIsValid')}
            </p>
          )}
        </div>
      )}

      {validatorActionType === ValidatorActionType.EditValidator && (
        <div className="flex flex-col items-stretch gap-1">
          <InputLabel
            name={t('form.editValidatorMessage')}
            tooltip={t('form.editValidatorMessageTooltip')}
          />
          <CodeMirrorInput
            control={control}
            error={errors?.editMsg}
            fieldName={fieldNamePrefix + 'editMsg'}
            readOnly={!isCreating}
            validation={[validateJSON]}
          />
          {errors?.editMsg?.message ? (
            <p className="text-error flex items-center gap-1 text-sm">
              <Close className="inline w-5" />{' '}
              <span>{errors.editMsg?.message}</span>
            </p>
          ) : (
            <p className="text-success flex items-center gap-1 text-sm">
              <Check className="inline w-5" /> {t('info.jsonIsValid')}
            </p>
          )}
        </div>
      )}
    </>
  )
}
