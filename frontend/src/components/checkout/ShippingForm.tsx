import { useForm } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getShippingRates } from '@/services/shippingService';
import styles from '@/app/styles/shippingForm.css';

export default function ShippingForm({ onSubmit }) {
    const { register, handleSubmit, errors } = useForm();

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <input {...register('street', { required: true })} placeholder="Street" />
            <input {...register('city', { required: true })} placeholder="City" />
            <input {...register('state', { required: true })} placeholder="State" />
            <input {...register('phone', {
                required: true,
                pattern: /^(\+)?[\d\s-]{10,}$/
            })} placeholder="Phone" />
            <input {...register('email', {
                required: true,
                pattern: /^\S+@\S+\.\S+$/
            })} placeholder="Email" />
            <button type="submit">Continue</button>
        </form>
    );
}

export function ShippingMethod({ onSelect }) {
    const { data: shippingRates } = useQuery('shippingRates', getShippingRates);

    return (
        <div className={styles.shippingMethods}>
            {shippingRates?.map(rate => (
                <div
                    key={rate._id}
                    className={styles.methodCard}
                    onClick={() => onSelect(rate)}
                >
                    <h3>{rate.region}</h3>
                    <p>{rate.description}</p>
                    <span>${rate.cost}</span>
                </div>
            ))}
        </div>
    );
}
