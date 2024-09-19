import { Input as GluestackInput, InputField, FormControl, FormControlErrorText, FormControlError } from "@gluestack-ui/themed";
import { ComponentProps } from "react";

type Props = ComponentProps<typeof InputField> & {
    errorMessage?: string | null
    isInvalid?: boolean
    isReadOnly?: boolean
}

export function Input({ isReadOnly = false, errorMessage = null, isInvalid = false, ...rest }: Props) {
    const invalid = !!errorMessage || isInvalid
    return (
        <FormControl isInvalid={invalid} w="$full" mb="$4">
            <GluestackInput
                isInvalid={isInvalid}
                h="$14"
                borderWidth="$0"
                borderRadius="$md"
                $invalid={{
                    borderWidth: 1,
                    borderColor: "$red500",
                }}
                $focus={{
                    borderWidth: 1,
                    borderColor: invalid ? "$red500" : "$green500",
                }}
                isReadOnly={isReadOnly}
                opacity={isReadOnly ? 0.5 : 1}
            >
                <InputField
                    px="$4"
                    bg="$gray700"
                    color="$white"
                    fontFamily="$body"
                    placeholderTextColor="$gray300"
                    {...rest} />
            </GluestackInput>
            <FormControlError>
                <FormControlErrorText color="$red500">
                    {errorMessage}
                </FormControlErrorText>
            </FormControlError>
        </FormControl>
    )
}