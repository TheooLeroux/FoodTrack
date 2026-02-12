import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import * as React from 'react'
import { Pressable, StyleSheet, TextInput, View, Text, ActivityIndicator } from 'react-native'

export default function Page() {
    const { signIn, setActive, isLoaded } = useSignIn()
    const router = useRouter()

    const [emailAddress, setEmailAddress] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [code, setCode] = React.useState('')
    const [showEmailCode, setShowEmailCode] = React.useState(false)
    const [loading, setLoading] = React.useState(false)

    // Handle the submission of the sign-in form
    const onSignInPress = React.useCallback(async () => {
        if (!isLoaded) return
        setLoading(true)

        try {
            const signInAttempt = await signIn.create({
                identifier: emailAddress,
                password,
            })

            if (signInAttempt.status === 'complete') {
                await setActive({
                    session: signInAttempt.createdSessionId,
                })
                router.replace('/')
            } else if (signInAttempt.status === 'needs_second_factor') {
                // Suppression du type TypeScript "EmailCodeFactor" car on est en .js
                const emailCodeFactor = signInAttempt.supportedSecondFactors?.find(
                    (factor) => factor.strategy === 'email_code'
                )

                if (emailCodeFactor) {
                    await signIn.prepareSecondFactor({
                        strategy: 'email_code',
                        emailAddressId: emailCodeFactor.emailAddressId,
                    })
                    setShowEmailCode(true)
                }
            } else {
                console.error('Sign-in incomplete status:', signInAttempt.status)
            }
        } catch (err) {
            console.error('Sign-in error:', JSON.stringify(err, null, 2))
            alert(err.errors ? err.errors[0].message : "Une erreur est survenue")
        } finally {
            setLoading(false)
        }
    }, [isLoaded, signIn, setActive, router, emailAddress, password])

    // Handle the submission of the email verification code
    const onVerifyPress = React.useCallback(async () => {
        if (!isLoaded) return
        setLoading(true)

        try {
            const signInAttempt = await signIn.attemptSecondFactor({
                strategy: 'email_code',
                code,
            })

            if (signInAttempt.status === 'complete') {
                await setActive({
                    session: signInAttempt.createdSessionId,
                })
                router.replace('/')
            } else {
                console.error('Verification incomplete status:', signInAttempt.status)
            }
        } catch (err) {
            console.error('Verification error:', JSON.stringify(err, null, 2))
            alert(err.errors ? err.errors[0].message : "Code incorrect")
        } finally {
            setLoading(false)
        }
    }, [isLoaded, signIn, setActive, router, code])

    if (showEmailCode) {
        return (
            <View style={styles.container}>
                <Text style={[styles.label, styles.title]}>
                    Verify your email
                </Text>
                <Text style={styles.description}>
                    A verification code has been sent to your email.
                </Text>
                <TextInput
                    style={styles.input}
                    value={code}
                    placeholder="Enter verification code"
                    placeholderTextColor="#666666"
                    onChangeText={setCode}
                    keyboardType="numeric"
                />
                <Pressable
                    style={({ pressed }) => [
                        styles.button,
                        pressed && styles.buttonPressed,
                        loading && styles.buttonDisabled
                    ]}
                    onPress={onVerifyPress}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Verify</Text>
                    )}
                </Pressable>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <Text style={[styles.label, styles.title]}>
                Sign in
            </Text>

            <Text style={styles.label}>Email address</Text>
            <TextInput
                style={styles.input}
                autoCapitalize="none"
                value={emailAddress}
                placeholder="Enter email"
                placeholderTextColor="#666666"
                onChangeText={setEmailAddress}
                keyboardType="email-address"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
                style={styles.input}
                value={password}
                placeholder="Enter password"
                placeholderTextColor="#666666"
                secureTextEntry={true}
                onChangeText={setPassword}
            />

            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    (!emailAddress || !password || loading) && styles.buttonDisabled,
                    pressed && styles.buttonPressed,
                ]}
                onPress={onSignInPress}
                disabled={!emailAddress || !password || loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Sign in</Text>
                )}
            </Pressable>

            <View style={styles.linkContainer}>
                <Text>Don't have an account?</Text>
                <Link href="/sign-up" asChild>
                    <Pressable>
                        <Text style={styles.linkText}>Sign up</Text>
                    </Pressable>
                </Link>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        gap: 12,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        marginBottom: 8,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        marginBottom: 16,
        opacity: 0.8,
        textAlign: 'center',
    },
    label: {
        fontWeight: '600',
        fontSize: 14,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#0a7ea4',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
        minHeight: 48, // Pour éviter que le bouton saute quand le spinner apparaît
        justifyContent: 'center',
    },
    buttonPressed: {
        opacity: 0.7,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    },
    linkContainer: {
        flexDirection: 'row',
        gap: 4,
        marginTop: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    linkText: {
        color: '#0a7ea4',
        fontWeight: '600',
    }
})