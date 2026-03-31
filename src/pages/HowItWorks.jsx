const HowItWorks = () => (
  <div className="min-h-0 flex-1 bg-gradient-to-br from-blue-50 via-white to-primary-50 py-12 px-6">
    <div className="mx-auto max-w-[760px] space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">How It Works</h1>
      <ol className="list-decimal pl-5 space-y-3 text-gray-600">
        <li>Sign up and pick your university during onboarding.</li>
        <li>Browse or post lost and found items on your campus feed.</li>
        <li>Use filters and search to narrow down what you are looking for.</li>
        <li>For found items, owners can submit a claim; for lost items, others can contact you using your chosen preference.</li>
        <li>When a claim is approved, reputation points help recognise helpful finders.</li>
      </ol>
    </div>
  </div>
);

export default HowItWorks;
